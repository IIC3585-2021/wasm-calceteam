import Module from "./main.js";

const makePtrOfArray = (myModule, N, distanceMatrix) => {
  const arrayPtr = myModule._calloc(N, 4);
  for (let i = 0; i < N; i++) {
    let rowsPtr = myModule._calloc(N, 4);
    myModule.setValue(arrayPtr + i * 4, rowsPtr, "i32");
    for (let j = 0; j < N; j++) {
      myModule.setValue(rowsPtr + j * 4, distanceMatrix[i][j], "i32");
    }
  }
  return arrayPtr;
}

const getArrayFromPtr = (myModule, ptr, size) => {
  let resultMatrix = [];

  for (let i = 0; i < size; i++) {
    resultMatrix.push(myModule.getValue(ptr + i * 4, "i32"));
  }
  return resultMatrix;
}

Module().then(function (mymod) {
  document.getElementById("button").addEventListener("click", () => {
    const text = document.getElementById("text").value;
    const lines = text.split("\n");
  	const arr = [];
    const edges = lines.map(line => line.split(" "));
    const nodes = new Set();
    edges.forEach( edge => {
      nodes.add(edge[0]);
      nodes.add(edge[1]);
    });
    const row = [];
    const nodesArray = Array.from(nodes);
    const nodesMap = {}
    for (let x = 0; x < nodes.size; x++) {
      row.push(-1);
      nodesMap[nodesArray[x]] = x
    }
    for (let x = 0; x < nodes.size; x++) {
      arr.push(new Array(...row));
    }
    for (let x = 0; x < nodes.size; x++) {
      arr[x][x] = 0;
    }
    edges.forEach(edge => {
      arr[nodesMap[edge[0]]][nodesMap[edge[1]]] = +edge[2];
      arr[nodesMap[edge[1]]][nodesMap[edge[0]]] = +edge[2];
    });
    console.log(arr);
    console.log(nodesMap);
    document.getElementById("result").innerHTML = "ABCDEGF = 51";

    let arrPtr = makePtrOfArray(mymod, nodes.size, arr);
  	let pathPtr = mymod._calloc(nodes.size, 4);
    let startDate = window.performance.now();
    let solutionLength = mymod._SolveTSP(arrPtr, nodes.size, pathPtr);
    let endDate = window.performance.now();
    let solution = getArrayFromPtr(mymod, pathPtr, nodes.size);
    console.log(solutionLength, solution);
    alert(`${solutionLength ? 'Solved!': 'No results found'} Excecution time: ${(endDate - startDate)} ms`);
  });

})

