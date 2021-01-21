---
title: Minesweeper Coding Challenge
date: 2020-4-2T05:25:44.226Z
path: blog/minesweaper-coding-challenge
cover: ./preview.png
excerpt: Solving the minesweaper coding challenge on CodeSignal.
---

## Problem Statement

As stated on [CodeSignal](https://app.codesignal.com/arcade/intro/level-5/ZMR5n7vJbexnLrgaM) :

In the popular Minesweeper game you have a board with some mines and those cells that don't contain a mine have a number in it that indicates the total number of mines in the neighboring cells. Starting off with some arrangement of mines we want to create a Minesweeper game setup.

## Input and output examples

#### For Input :

```
matrix = [[true, false, false],
          [false, true, false],
          [false, false, false]]
```

#### Output :

```
minesweeper(matrix) = [[1, 2, 1],
                       [2, 1, 1],
                       [1, 1, 1]]
```

## Solution:

```cpp
std::vector<std::vector<int>> minesweeper(std::vector<std::vector<bool>> matrix) {
    std::vector<std::vector<int>> res;
    for (int y = 0; y < matrix.size(); y++ ){
        std::vector<int> row;
        for (int x = 0; x < matrix[y].size(); x++){
            int count = 0;
                for (int a = -1; a <= 1; a++){
                    for(int b = -1; b <= 1; b++){
                        int c = a + y, d = b + x;
                        if (c == y && d == x){
                            continue;
                        }
                        if (0 <= c && c < matrix.size() && 0 <= d && d < matrix[0].size()) {
                            count += matrix[c][d] ? 1 : 0;
                        }

                    }
                }
            row.push_back(count);
        }
        res.push_back(row);
    }
    return res;
}
```
