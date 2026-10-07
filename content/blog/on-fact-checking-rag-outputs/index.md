---
# Source: https://www.linkedin.com/posts/ahmedaabouzied_ai-ragsystems-rags-ugcPost-7278116495077871616-hRWk/
title: "On Fact-checking RAG Outputs"
date: 2024-12-26T18:36:34Z
draft: false
lang: en
slug: on-fact-checking-rag-outputs
tags: [tech, ai, rag, python, fact-checking]
description: "Exploring what fact-checking means, then using an LLM fact extractor and DeBERTa to detect contradictions between RAG answers and their context."
---

## Overview

In this article, we explore the challenges and methods of **fact-checking RAG**

(Retrieval-Augmented-Generation) output.

We begin with a **philosophical rant** about what exactly a fact is. And why I think knowledge is better represented in an “index” **(encyclopedia) rather than in a “knowledge graph”**.

Following that, we go into **practical experiments**, including:

- Implementing a **fact extractor** using "GPT-4o-mini".
- Utilizing "DeBERTa" for **detecting contradictions** between two sentences.
- Building a **fact-checker pipeline**.
- Finally, we test these tools in a controlled environment using a single-document Retrieval-Augmented Generation (RAG) setup to **detect if the RAG system has given us false information**.

**The code accompanying this article can be found** [**here on Github.**](https://github.com/ahmedaabouzied/rag-systems/tree/main/fact_checking)

## The interestingly lame question of what a fact is

I'm not a cynic (maybe a little), sure, but things do happen for a fact. It's just that our narrative of them is entirely relative. We can not check if something happened or not for real. **What we can do is check one narrative against another.** And hope that the narrative we consider as premise is a fact.

Sure, **simple sentences are easy to, easy enough to comprehend.** “Ahmed went to the doctor” is an easy one.

But let's consider “Ahmed went eagerly to the doctor”. Now that's very difficult. What does eagerly mean? Does it match with the other sentence “Ahmed wanted to go to the doctor”?

It's tricky!

Let's consider another sentence describing a scientific fact that says "**Plants start photosynthesis early in the morning". Now does that mean that they start at 8:00? 6:00?**

How would this sentence be matched against the sentence **“Plants start photosynthesis in the morning”. One of them is more “correct” than the other.**

## Knowledge as a graph

Taking the simple sentence of "Plants do photosynthesis”, we can **represent it as a graph.** With “Plants” as a node, “Photosynthesis” as another node  and they are connected through an edge with a label “do” or the whole sentence can be the label.

This constructs a knowledge graph.

{{< figure src="simple-knowledge-graph.jpg" alt="Very simple knowledge graph" caption="Very simple knowledge graph" width="1485" height="673" >}}

But when sentences get complex, the graphs get complex and putting knowledge into the graph also gets complex. **Again what about "Plants do photosynthesis early in the morning".**

## Encyclopedias (Indexes) are simpler

What has worked well so far to describe knowledge is simple text in encyclopedias. Plain old written knowledge in sentences using any language. **And we take the entities from each piece of text and we put it in an index for easier lookup.**

## Extracting facts from text

LLMs can do a relatively good job of extracting the mentioned entities and their references in a piece of text. They can basically build an index. If we consider this text to be a true “**Premise**”, then we can consider the index of entities and their represented sentences as an index of entities and facts about those entities.

**Now let's build a simple fact extractor using an LLM.**

We define an abstract Python class called Extractor

```python
class _Extractor(ABC, Generic[T]):
    """ Extractor is a base class to extract info from a text using an LLM """
    # _model_name
    def set_model_name(self, model_name:str = "ollama3.2"):
        self._model_name = model_name

    def get_model_name(self):
        return self._model_name

    # _llm
    def set_llm(self, llm: Runnable):
        self._llm = llm

    def get_llm(self):
        return self._llm

    # _base_prompt
    def set_base_prompt(self, base_prompt: str):
        self._base_prompt = base_prompt

    def get_base_prompt(self):
        return self._base_prompt

    @abstractmethod
    def extract(self, paragraph: str) -> T | None:
        pass
```

Extractor class is a base class to extract info from a text using an LLM

And we implement it allowing using either llama3.2 or gpt-4o-mini. **I observed that for this task, llama3.2 failed miserably.**

```python
extract_facts_prompt = """
    Role: You'e an assistant for extracting entities and facts about thos intenties from a piece of text.
    Given a paragraph, extract all meaningful entities in it and the facts mentioned in the text about those entities.

    Input: {input}
"""

class FactExtractor(_Extractor[Facts]):
    def __init__(self, model_name="llama3.2"):
        self.set_model_name(model_name)
        self.set_base_prompt(extract_facts_prompt)
        if model_name == LLAMA_MODEL:
            self.set_llm(langchain_ollama.ChatOllama(model=model_name).with_structured_output(Facts))
        elif model_name == OPEN_AI_MODEL:
            if not os.environ.get("OPENAI_API_KEY"):
                os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")
            self.set_llm(langchain_openai.ChatOpenAI(model=model_name).with_structured_output(Facts))

    def extract(self, paragraph: str) -> Facts | None:
        """ Extracts the information from a given text and formats the output based on the return type """
        try:
            prompt = self.get_base_prompt().format(input=paragraph)
            return self.get_llm().invoke(prompt)
        except Exception as e:
            print(f"error extracting facts: {e}")
            return None
```

Fact extractor class

And the return type of this extract method is this special type

```python
class Entity(BaseModel):
    entity: str = Field(description="An entity")
    sentences: list[str] = Field(description="Sentences that mention the entity")

class Facts(BaseModel):
    entities: list[Entity] = Field()

    def to_dict(self) -> dict[str, list[str]]:
        res = {}
        for entity in self.entities:
            res[entity.entity] = entity.sentences
        return res

    def lookup_similar(self, key: str) -> list[str]:
        index = self.to_dict()
        res: list[str] = [];
        parts = key.split(" ")
        parts += key.split("-")
        parts += key.split("_")
        parts += key.split(",")
        for part in parts:
            for key in index.keys():
                if part in key:
                    res += index[key]
        return res
```

Facts type class

The above fact extractor can extract entities and facts from a paragraph.

For example if we give it an input of "Go supports generics", it will give us something like this:

```text
Go           ---> ["Go supports generics"]
generics ---> ["Go supports generics"]
```

## Detecting contradiction

Now when it comes to fact-checking, there is **no general absolute fact checking**. We can only **compare a hypothesis against a premise**.

**Consider this:**

Hypothesis: "Go supports generics".

Premise: "Go supports generics as of version go1.18".

They **do not contradict, but they don't match 100%**. Therefore, this fact checking should **not return a boolean.** It should give us a **score** and a **classification**. A good job for an encoder only transformer models which can do a good job of understanding text and classifying it.

I'll choose [DeBERTa](https://github.com/microsoft/DeBERTa) for detecting contradiction.

### How does it differ from an LLM?

In short, **LLMs excel in text generation** and general-purpose tasks, while BERT and **DeBERTa specialize in text comprehension** and specific NLP applications.

### An observation with BERT and DeBERTA

I observed through experimenting that **passing two sentences** to DeBERTa is far more accurate in detecting contradiction than **passing a paragraph** as the premise and a sentence or another paragraph as a hypothesis.

### Now let's build a fact-checker with DeBERTa

```python
class Checker():
    labels: dict[int, str]
    model: PreTrainedModel
    tokenizer: PreTrainedTokenizer

    def __init__(self, model_name="microsoft/deberta-large-mnli"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.labels = {0: "contradiction", 1: "neutral", 2:"entailment"}

    def check_contradiction(self, premise: str, hypothesis: str):
        # Tokenize the inputs
        inputs = self.tokenizer(premise, hypothesis, return_tensors="pt")

        # Get model output
        outputs = self.model(**inputs)
        logits = outputs.logits

        # Apply softmax to the logits to get probabilies
        probabilities = torch.softmax(logits, dim=-1)

        # Get the index of the max probability
        predicted_index = int(torch.argmax(probabilities).item())
        predicted_label = self.labels[predicted_index]

        # Get the value of the max probability
        confidence = probabilities.max().item()

        return predicted_label, confidence
```

Fact checker with DeBERTa

Our fact checker class returns a **score** and a **classification** of either a

- **Contradiction**.
- **Entailment.**
- **Neutral**.

Now  let's utilize those 2 components into a RAG system to fact-check the RAG system LLM output against the context to decrease the likelihood of hallucination.

## Building a test hallucinating RAG

We use **langchain** graph as we did in previous articles to spin up a simple RAG system. But we **hijack the LLM answer with something false**. And see how our fact-checker does.

Here we initialize the LLM, fact-checker, fact-extractor and the RAG state. We also **hard code one blog post** to use in our retriever.

```python
blog_post = """
        The Go 1.18 release adds a major new language feature: support for generic programming. In this article I’m not going to describe what generics are nor how to use them. This article is about when to use generics in Go code, and when not to use them.

        To be clear, I’ll provide general guidelines, not hard and fast rules. Use your own judgement. But if you aren’t sure, I recommend using the guidelines discussed here.

        Write code

        Let’s start with a general guideline for programming Go: write Go programs by writing code, not by defining types. When it comes to generics, if you start writing your program by defining type parameter constraints, you are probably on the wrong path. Start by writing functions. It’s easy to add type parameters later when it’s clear that they will be useful.
        When are type parameters useful?

        That said, let’s look at cases for which type parameters can be useful.
        When using language-defined container types

        One case is when writing functions that operate on the special container types that are defined by the language: slices, maps, and channels. If a function has parameters with those types, and the function code doesn’t make any particular assumptions about the element types, then it may be useful to use a type parameter.
    """

def init_llm():
    global llm
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def init_checker():
    global fact_checker
    fact_checker = fc.Checker()

def init_extractor():
    global fact_extractor
    fact_extractor = extract.FactExtractor("gpt-4o-mini")

class State(TypedDict):
    question: str
    context: str
    answer: str
```

Rag initialization

We define a **fake retriever** to use only this blog post as context. Also, we **hijack the generate function to return something not correct**.

```python
def retrieve(state: State):
    _ = state # We're not using the state here
    # ... Fake document retrival 
    retrieved_doc = blog_post
    return {"context": retrieved_doc}

def generate(state: State):
    rag_prompt = """
    You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If the context doesn't provide an answer, just say that you don't know and nothing more and never leak the context or what topics it covers.

    Question: {question}

    Context: {context}

    Answer:
    """
    try:
        messages = rag_prompt.format(question = state["question"], context= state["context"])
        response = llm.invoke(messages)
        # return {"answer": response.content}
        return {"answer": "Yes, Go supports generics as of the Go 1.13 release."}
    except Exception as e:
        print(f"error generating response form LLM: {e}")
        return {"answer": "I don't know how to answer this question"}
```

Hijacking the retrieve and generate functions

Then we define a **fact checking step** to go over the facts in the answer and compare them with the facts found in the context.

It's probably a good idea to **do this fact extraction operation on the documents while we load them into the stores**. We should avoid extracting facts from them on every run.

```python
def fact_check(state: State):
    facts_in_context = fact_extractor.extract(state["context"])
    if facts_in_context is None:
        print("Warning: Could not check RAG context for contradictions")
        return
    facts_in_answer = fact_extractor.extract(state["answer"])
    if facts_in_answer is None:
        print("Warning: Could not check RAG answer for contradictions")
        return

    contradictions = 0
    checked_hypothesis = {}
    for answer_entity, hypotheses in facts_in_answer.to_dict().items():
        for premise in facts_in_context.lookup_similar(answer_entity):
            for hypothesis in hypotheses:
                if hypothesis in checked_hypothesis:
                    continue
                checked_hypothesis[hypothesis] = {}
                (check_result, score) = fact_checker.check_contradiction(premise, hypothesis)
                if check_result == "contradiction" and score > 0.5:
                    print(f"\n Found contradiction in answer with known context.\n Premise: {premise} \n Hypothesis: {hypothesis}")
                    contradictions += 1

    if contradictions == 0:
        print("Fact checker validated RAG answer and found no contradictions.")
```

Fact checking logic

Next we **glue it all together** with a main function and an output function to print the output

```python
def output(state: State):
    print(state["answer"])

def main():
    init_llm()
    init_extractor()
    init_checker()
    graph_builder = StateGraph(State).add_sequence([retrieve, generate, output, fact_check])
    graph_builder.add_edge(START, "retrieve")
    graph = graph_builder.compile()

    graph.invoke({"question": "Does Go support generics"})

if __name__ == "__main__":
    main()
```

Main function gluing all of it together

**And we run it**

{{< figure src="fact-checking-output.png" alt="Output of fact-checking false RAG output" caption="Output of fact-checking false RAG output" width="2232" height="417" >}}

**Voile!**
