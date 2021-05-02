// A Backtracking program in
// C++ to solve Sudoku problem
#include <cstdint>
#include <vector>
#include <cstddef>
#include <iostream>
#include <cstring>
#include <emscripten.h>
#include <sstream>
using namespace std;

// Extraído de https://github.com/yuxiexiao/cpp-tsp
uint32_t circuitLength(uint32_t **graph, const vector<int> &order) {
    uint32_t length = 0;

    for (unsigned int i = 1; i < order.size(); i++){
    	if(graph[order[i - 1]][order[i]] == -1) {
    		return INT_MAX;
    	}
    	length += graph[order[i - 1]][order[i]];
    }
    return length;
}

// Extraído de https://github.com/yuxiexiao/cpp-tsp
uint32_t findShortestPath(uint32_t **graph, uint32_t size, uint32_t* path) {
   vector<int> order(size);
   vector<int> bestPath(size);
   int shortestLen;
   int currentLen;

   // initialize order with [0, 1, 2, 3, ... n]
   for (unsigned int i = 0; i < size; i++) {
       order[i] = i;
   }

   shortestLen = circuitLength(graph, order);
   currentLen = shortestLen;
   bestPath = order;

   vector<int> orderCopy(order);

   // permute all paths and find the shortest length
   while (next_permutation(orderCopy.begin(), orderCopy.end())){
       currentLen = circuitLength(graph, orderCopy);
       if (currentLen < shortestLen) {
           shortestLen = currentLen;
           bestPath = orderCopy;
       }
   }

   for (int i = 0; i < bestPath.size(); ++i) { 
   		path[i] = bestPath[i];
   }
   return shortestLen;
}

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  uint32_t SolveTSP(uint32_t **graph, uint32_t nodes, uint32_t *pathPtr)
  {
   	int length = findShortestPath(graph, nodes, pathPtr);
   	return length;
  }
}
