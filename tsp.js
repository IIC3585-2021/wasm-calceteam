// Se importa el modulo WASM generado
import Module from "./main.js";

// Se obtiene la libreria para graficar
const vis= window.vis;

// Pasa un array a punteros
const makePtrOfArray = (myModule, n, distanceMatrix) => {
  const arrayPtr = myModule._calloc(n, 4);
  for (let i = 0; i < n; i++) {
    let rowsPtr = myModule._calloc(n, 4);
    myModule.setValue(arrayPtr + i * 4, rowsPtr, "i32");
    for (let j = 0; j < n; j++) {
      myModule.setValue(rowsPtr + j * 4, distanceMatrix[i][j], "i32");
    }
  }
  return arrayPtr;
}

// Se obtiene el array desde los punteros
const getArrayFromPtr = (myModule, ptr, size) => {
  let resultMatrix = [];
  for (let i = 0; i < size; i++) {
    resultMatrix.push(myModule.getValue(ptr + i * 4, "i32"));
  }
  return resultMatrix;
}

// Se cambia el path de posiciones de la matriz a nodos
const getPath = (idArray, mapping) => {
  let path = idArray.join('');
  for (let i = 0; i < mapping.length; i++) {
    path = path.replace(i, mapping[i])
  }
  return path
}

// Se configura el callback del modulo
Module().then(function (mymod) {
  // Se configura el listner del boton para resolver
  document.getElementById("button").addEventListener("click", () => {
    // Se obtiene el contenido del input
    const text = document.getElementById("text").value;

    // Se revisa que no esté vácio
    if (text.length === 0) {
      alert("Debe ingresar las aristas del grafo")
      return;
    }

    // Parse del input (aristas) obtenido
    const lines = text.split("\n");
  	const arr = [];
    const edges = lines.map(line => line.split(" "));

    // Se obtienen los nodos del grafo según las aristas
    const nodes = new Set();
    edges.forEach( edge => {
      nodes.add(edge[0]);
      nodes.add(edge[1]);
    });

    // Variables para construir la matriz
    const nodesArray = Array.from(nodes);
    const row = [];

    // Objeto para mapear nodo-posición en la matriz
    const nodesMap = new Object();  

    // Arreglos para nodos y aristas a graficar
    const nodes2graph = []
    const edges2graph = []

    // Ciclo sobre el número de nodos del grafo
    for (let x = 0; x < nodes.size; x++) {
      // Se genera una columna de la matriz con valores default
      row.push(-1);

      // Se genera el mapeo nodo-posicion
      nodesMap[nodesArray[x]] = x;

      // Se generan los nodos para graficar
      nodes2graph.push({ id: x, label: nodesArray[x], shape: 'circle' });
    }

    // Se genera la matriz
    for (let x = 0; x < nodes.size; x++) {
      arr.push(new Array(...row));
    }

    // Se ponen 0 en la diagonal de la matriz
    for (let x = 0; x < nodes.size; x++) {
      arr[x][x] = 0;
    }

    // Se recorre el conjunto de aristas
    edges.forEach(edge => {
      // Se agregan los pesos de las aristas de forma simetrica en la matriz
      arr[nodesMap[edge[0]]][nodesMap[edge[1]]] = +edge[2];
      arr[nodesMap[edge[1]]][nodesMap[edge[0]]] = +edge[2];

      // Se generan las aristas para graficar
      edges2graph.push({ from: nodesMap[edge[0]], to: nodesMap[edge[1]], label: edge[2] })
    });

    // Se carga el array de adyacencia a memoria
    let arrPtr = makePtrOfArray(mymod, nodes.size, arr);

  	let pathPtr = mymod._calloc(nodes.size, 4);

    // Se ejecuta el solver en Wasm y se mide el tiempo de ejecución
    let startDate = window.performance.now();
    let solutionLength = mymod._SolveTSP(arrPtr, nodes.size, pathPtr);
    let endDate = window.performance.now();
    
    // Se obtiene el path desde el puntero
    let solution = getArrayFromPtr(mymod, pathPtr, nodes.size);

    // Se ponen los resultados obtenidos en el html
    document.getElementById("path").innerHTML = `Camino: ${getPath(solution, nodesArray)}`;
    document.getElementById("length").innerHTML = `Largo: ${solutionLength} u`
    document.getElementById("time").innerHTML = `Tiempo: ${(endDate - startDate)} ms`

    // Se obtienen las aristas del camino solución y se les da un color diferente
    const edgesColor = Array.from(edges2graph)
    for (let i = 1; i < solution.length; i++) {
      for (let j = 0; j < edges2graph.length; j++) {
        const edge = edges2graph[j];
        if (edge.from === solution[i] && edge.to === solution[i-1]) {
          edgesColor[j] = {...edge, color: { color: "red" }}
        }
        if (edge.from === solution[i-1] && edge.to === solution[i]) {
          edgesColor[j] = {...edge, color: { color: "red" }}
        }
      }
    }

    //Se generan los sets de nodos y aristas para graficar
    const graphnodes = new vis.DataSet(nodes2graph);
    const graphedges = new vis.DataSet(edgesColor);

    // Se obtiene el div para mostar el grafo
    const container = document.getElementById("mynetwork");

    // Se genera el grafo y se imprime en el div
    const data = {
      nodes: graphnodes,
      edges: graphedges,
    };
    const options = {};
    const network = new vis.Network(container, data, options);
  });

})

// Listener del boton para limpiar la página
document.getElementById('clear-button').addEventListener('click', () =>{
  // Se resetean los valores de todos los elementos a los iniciales
  document.getElementById('text').value='';

  document.getElementById('path').innerHTML = 'Camino:';
  document.getElementById('length').innerHTML = 'Largo:';
  document.getElementById('time').innerHTML = 'Tiempo:';

  var graphnodes = new vis.DataSet([]);
  var graphedges = new vis.DataSet([]);
  var container = document.getElementById('mynetwork');
    var data = {
      nodes: graphnodes,
      edges: graphedges,
    };
    var options = {};
    var network = new vis.Network(container, data, options);
})