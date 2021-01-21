---
title: On Memory Management in C++
date: 2019-09-13T05:25:44.226Z
description: A deeper look into memory management in c++.
---

## Overview

Due to it's being type unsafe , it's very difficult to develop a garbage collector for c++. It's rather something that the C++ community often boosts about. It's true that it makes the compiled programs very lean and smaller in size. However it adds work to the development process. You'd have to handle the memory yourself as a c++ developer.

## Types of memory

There are mainly three types of memory that can be used by the developer :

1. Global Memory.
2. Stack Memory.
3. Heap Memory.

**Global memory** is alocated by the operating system loader. It exists in two diffirent locations : `.bss` (un-initialized memory) and `.data` (value initialized memory).

These are the global variables declared outside of function scopes in c++. For following example is from the great book "Hands-On System Programming With C++"

```cpp
#include <iostream>

int bss_mem = 0;
int data_mem = 42;

int main()
{
    std::cout << bss_mem << '\n';  // ==> 0
    std::cout << data_mem << '\n'; // ==> 42
}
```

Global memory specially value-initialized memory increase the size of the program on disk, therefore longer loading time.

**Stack memroy** stores values in the order they are declared and these values are removed in the oposite order. Applying "last in first out" such as regular stack data structures. Thus all data stored on the stack must have known , fixed size.

When a function is called , it's pushed to the memory stack. All variables declared in that function are pushed to the stack right after the function one after the other. When that function returns , items are popped out of the stack one after the other until the function is popped. This is basically how function scope is implemented.

**Heap memory** stores data with size that might change. The heap is less organized. When data is put on the heap , the program requests a certain amount of space from the operating system. The operating system responds with an empty spot on the stack that is big enough , marks it as being in use and returns a pointer. Accessing data in the heap is usually slower than accessing the stack because you'd have to follow a pointer which means that you're jumping around in memory.

The process is described with very decent analogy on the rust-lang documentation website as follows :

> Think of being seated at a restaurant. When you enter, you state the number of people in your group, and the staff finds an empty table that fits everyone and leads you there. If someone in your group comes late, they can ask where you’ve been seated to find you.

> consider a server at a restaurant taking orders from many tables. It’s most efficient to get all the orders at one table before moving on to the next table. Taking an order from table A, then an order from table B, then one from A again, and then one from B again would be a much slower process.

## Heap Allocation & Deallocation

Managing heap memory in c++ is through the `new()` and `delete()` operator functions as follows :

```cpp
#include <iostream>
int main()
{
    auto ptr = new int(42); // allocating the variable on the heap and returning a pointer.
    std::cout << *ptr << '\n'; // ==> 42
    delete ptr; // releasing the memory.
}
```

This technique results in possible errors such as forgetting to call `delete()` to release the memory or calling `delete()` instead of `delete []` when de-allocating an array.

## Ownership

In C++11 the concept of pointer ownership was introduced to make it easier and less error prone to manage the heap memory. The following two classes were introduced to achieve this :

- `std::unique_ptr{}` : A pointer uniquely owned by a signle entity.
  This pointer is automatically deallocated by the compiler when it gets out of scope. Copying this pointer is not allowed.

- `std::shared_ptr{}` : A pointer that may be owned by more that one entities. This pointer is deallocated automatically when all owners have released ownership of it. Copying this pointer is allowed.

It's discouraged by the C++ guidelines to perform any dynamic memory allocations by other that those two classes. Thus `std::unique_ptr{}` should be used instead of `new()` and `delete()`. To prevent memory leaks.

The previous example should be changed to be the following :

```cpp
#include <memory>
#include <iostream>

int main()
{
    auto ptr = std::make_unique<int>(42);
    std::cout << *ptr << '\n'; // ==> 42
}
```

The following functions can be used to create unique and shared pointers :

`std::make_unique<type>(args)` to create `std::unique_ptr{}` that allocates and deallocates a single object.

`std::make_unique<type[]>(size)` to create `std::unique_ptr{}` that performs array allocation and deallocations.

`std::make_shared()` to create `std::shared_ptr{}`.

### The Unique Pointer Class

It should be noted that `std::unique_ptr{}` accpets a pointer previously allocated by `new()` and on destruction , releases the memory it was given via `delete`.

The unique pointer can release it's allocation back to the heap on demand by calling the `reset()` function upon it. It explicitly tells the pointer to release it's memory on demand without having to lose scope. It's demonstrated in the following example :

```cpp
#include <memory>
#include <iostream>
int main()
{
    auto ptr = std::make_unique<int>();
    std::cout << ptr.get() << '\n'; // ==> 0x55bcfa2b1e70
    ptr.reset();
    std::cout << ptr.get() << '\n'; // ==> 0 (null pointer)
    if(ptr){ // the boolean operator is used to check if the pointer is null
        std::cout << *ptr << '\n';
    }
}
```

#### The Shared Pointer Class

Consider that you have two threads T1, T2. T1 creates a pointer and thus owns it. T2 has to use that pointer from T1 and thus owns it as much as T1.

Handling this with `new()` and `delete()` can be quite messy since it's difficult to predict if the other thread is no longer using the pointer and therefore is't difficult to determine when to release the memory and from which thread this should be done.

The `std::shared_pt{}` solves this problem with ease as in the following example.

```cpp
#include <thread>
#include <iostream>
#include <memory>

class myclass
{
    int m_data{0};
public:
    ~myclass()
    {
        std::cout << "myclass deleted\n";
    }
    void inc()
    {
        m_data++;
    }
};

std::thread t1;
std::thread t2;

void thread2(const std::shared_ptr<myclass> ptr)
{
    for (auto i = 0; i < 100000;i++){
        ptr->inc();
    }
    std::cout << "thread2: complete\n";
}

void thread1()
{
    auto ptr = std::make_shared<myclass>();
    t2 = std::thread(thread2,ptr);

    for (auto i = 0; i < 10; i++){
        ptr->inc();
    }
    std::cout << "thread1 : complete\n";
}

int main()
{
    t1 = std::thread(thread1);
    t2.join();
    t2.join();
}
// > g++ -std=c++17 -lpthread main.cpp; ./a.out
// thread1: complete
// thread2: complete
// myclass deleted
```
