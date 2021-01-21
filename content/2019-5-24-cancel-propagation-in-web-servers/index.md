---
title: Cancel Propagation in Web Servers
date: 2019-5-24T05:25:44.226Z
path: blog/cancel-propagation-in-web-servers
cover: ./preview.png
excerpt: Using the context package to propagate cancel events to save resource in web servers
---

## On Cancellation

Consider the common situation of a web server making a call to the database then returning the data to the client .

```
+--------+                     +--------+                   +----------+
|        |  +---Requset--->    |        |  +---Request--->  |          |
| Client |                     | Server |                   | Database |
|        |  <---Response--+    |        |  <---Response--+  |          |
+--------+                     +--------+                   +----------+
```

What would happen if the client cancelled the request in the middle ?This could be due to that it lost connection or just simply if the user cancels the request from the browser while it's still loading by closing the browser or simply clicking `x`. The `Server` and `Database` layers would still process the request and take resources and all this effort would render no profit since the data would not be sent to the client.

What if the third layer is not a locally running `Database` . It's rather a service like firebase authentication or another Api call that could timeout. You would need to cancel the other working services to stop them from consuming resources since the request will never be processed properly.

## The _context_ Package

The `context` package provides a way to propagate that cancel action accross layers .

Incoming requests to the server would create a Context and pass this context to the outgoing call to the proceding service , which in turn passes the same Context or a `Child` of it to the services it calls. This creates a chain of Contexts through function calls. Canceling one Context would cancel all Child Contexts derived from it.

Creating a child Context happens through the functions `WithCancel` , `WithDeadline` and `WithTimeout` which take a Context as a parameter and returns a Child Context and CancelFunc . Calling the `CancelFunc` would cancel the Child Context and remove the parent's reference to the child.

## A Practical Example

We are going to build a simple web server that returns the latest news headlines . Upon a request from a client the server would call an Api serivice (newsApi.org) to get the latest headlines and return them to the user.

```
+----------+                         +----------+                   +---------------+
|          |      +---Request--->    |          |  +---Request-->   |      News     |
|  Client  |                         |  Server  |                   |      API      |
|          |      <---Response--+    |          |  <---Respone--+   |    Service    |
+----------+                         +----------+                   +---------------+
```

We are going to use the context package to cancel the request to the newsApi if the user cancels the request or return a timeout message if the call to newsApi takes more than 3 seconds.

### 1. Get API Token

Head over to [NewsApi](https://www.newsapi.org) and get an API token to be able to query the API for the latest Headlines.

### 2. Create the web server

In our main function we would start a server on port `3000` and pass incoming requests to a `handler` function.

```go
package main

import (
    "net/http"
    "log"
)

func main(){
    // pass incoming requests to handler function
    http.HandleFunc("/", handler)

    // Start server and on port 3000
    log.Fatal(http.ListenAndServe(":3000", nil))
}
```

### 3. Create _handle_ function

Our handler function would do the following

```
    1. First it will create a context from the incoming request.
    2. Create a child context derived from it with the WithTimeout function.
    3. Call a function to get articles and pass the Child Context and CancelFunc to it.
    4. Get the errors from the child functions.
    5. If there is error return 'Timeout error to the client'.
    6. If there is no errors return what function getArticles returned.

```

it will be as follows :

```go
func handler(w http.ResponseWriter, r *http.Request) {
    // Create a context from request
    ctx := r.Context()

    // Create child context which times out after two seconds
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	log.Printf("Handler Started")
    defer log.Printf("Handler Ended")

    // Pass ctx and the CanelFunc to getArticles function
    art := getArticles(ctx, cancel)

    // Get the context errors
    err := ctx.Err()
    if err != nil {
        fmt.Fprintf(w, "Time out error \n")
    } else {
        fmt.Fprintf(w, "%v\n", art)
    }
}
```

### 4. Create _getArticles_ function

```go
func getArticles(ctx context.Context, cancel context.CancelFunc) []string {

    // Call get news function and pass the context to it
	resp, err := getNews(ctx, "https://newsapi.org/v2/top-headlines?country=us&apiKey=<API_KEY>")
	if err != nil {
        log.Printf("Context Canceled")
        // call the cancel func if getNews returns error
		cancel()
    }
    // parse the response into a struct
	c := new(ResponseCast)
    r := c.parseNews(resp)

    // return only the article titles in slice
    var t []string
    for i, article := range r.Articles {
        t = append(t, fmt.Sprintf("Article  %d  : %s \n", i, article.Title))
    }
    return t
}
```

### 5. Create _getNews_ function

```go
func getNews(ctx context.Context, link string) ([]byte, error) {

    // Create a request
	request, err := http.NewRequest(http.MethodGet, link, nil)
	if err != nil {
		return nil, err
    }
    // Mount the context onto that request
    request = request.WithContext(ctx)

    // Perform the request
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
    }

    // Read response body
	defer resp.Body.Close()
	a, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return a, nil
}
```

### Full Code with helper functions and structs

```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type ResponseCast struct {
	Status       string    `json:"status"`
	TotalResults int       `json:"totalResults"`
	Articles     []Article `json:"articles"`
}

type Article struct {
	Author      string `json:"author"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Url         string `json:"url"`
	ImageUrl    string `json:"urlToImage"`
	PublishedAt string `json:"publishedAt"`
	Content     string `json:"content"`
}

func getNews(ctx context.Context, link string) ([]byte, error) {
	request, err := http.NewRequest(http.MethodGet, link, nil)
	if err != nil {
		return nil, err
	}
	request = request.WithContext(ctx)
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	a, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return a, nil
}
func (c *ResponseCast) parseNews(ba []byte) *ResponseCast {
	json.Unmarshal(ba, c)
	return c
}

func getArticles(ctx context.Context, cancel context.CancelFunc) []string {
	resp, err := getNews(ctx, "https://newsapi.org/v2/top-headlines?country=us&apiKey=<API-KEY>")
	if err != nil {
		log.Printf("Context Canceled")
		cancel()
	}
	c := new(ResponseCast)
	r := c.parseNews(resp)
	var t []string
	for i, article := range r.Articles {
		t = append(t, fmt.Sprintf("Article  %d  : %s \n", i, article.Title))
	}
	return t
}
func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":3000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	log.Printf("Handler Started")
	defer log.Printf("Handler Ended")
	art := getArticles(ctx, cancel)
	err := ctx.Err()
	if err != nil {
		fmt.Fprintf(w, "Time out error \n")
	} else {
		fmt.Fprintf(w, "%v\n", art)
	}
}

```
