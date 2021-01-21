---
title: Box Blur Coding Challenge
date: 2020-4-1T05:25:44.226Z
path: blog/box-blur-coding-problem
cover: ./preview.png
excerpt: Solving the box blur coding challenge on CodeSignal.
---

## Problem Statement

As stated on [CodeSignal](https://app.codesignal.com/arcade/intro/level-5/5xPitc3yT3dqS7XkP) :

The pixels in the input image are represented as integers. The algorithm distorts the input image in the following way: Every pixel x in the output image has a value equal to the average value of the pixel values from the 3 × 3 square that has its center at x, including x itself. All the pixels on the border of x are then removed.

Return the blurred image as an integer, with the fractions rounded down.

## Input and output examples

#### For Input :

```
image = [[1, 1, 1],
         [1, 7, 1],
         [1, 1, 1]]
```

#### Output :

```
boxBlur(image) = [[1]]
```

To get the value of the middle pixel in the input 3 × 3 square: `(1 + 1 + 1 + 1 + 7 + 1 + 1 + 1 + 1) = 15 / 9 = 1.66666 = 1`. **The border pixels are cropped from the final result**.

#### For Input :

```
image = [[7, 4, 0, 1],
         [5, 6, 2, 2],
         [6, 10, 7, 8],
         [1, 4, 2, 0]]
```

#### Output :

```
boxBlur(image) = [[5, 4],
                  [4, 4]]
```

There are four 3 × 3 squares in the input image, so there should be four integers in the blurred output. To get the first value:

`(7 + 4 + 0 + 5 + 6 + 2 + 6 + 10 + 7) = 47 / 9 = 5.2222 = 5`. **The other three integers are obtained the same way, then the surrounding integers are cropped from the final result**.

## Solution:

```cpp
std::vector<std::vector<int>> boxBlur(std::vector<std::vector<int>> image) {
    std::vector<std::vector<int>> blurred; // the blurred image (matrix) that should be returned.
    // We go through the rows of the two dimentional matrix. Since we only care about 3x3 sub matricies we ignore the last two rows the
    // loop since they can't be the beginning of a 3x3 matrix.
    for (int y = 0; y < image.size() - 2; y++){
        std::vector<int> row; // represents a row in the blurred image (matrix) that should be returned.
        // We go through the columns of the two dimentional matrix. Since we only care about 3x3 matricies, we ignore the last two
        // columns since they can't be the beginning of a 3x3 matrix.
        for (int x = 0; x < image[y].size() -2; x++){
            int acc = 0; // an accumulator variable.
            // we now go through the elements of the 3x3 matrix we are on the beginning of.
            for (int a = y; a < y+3; a++){
               for (int b = x; b < x + 3; b++){
                   acc += image[a][b]; // add the current element (pixel) to the accumulator.
               }
            }
            row.push_back(acc/9); // we devide by 9 to get the average value for this 3x3 matrix.
        }
        blurred.push_back(row);
    }
    return blurred;
}
```
