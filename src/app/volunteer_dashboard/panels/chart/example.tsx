/*
 * How To Use:
 *
 * ReactFlow is the canvas component that renders an interactive node graph.
 * It is a controlled component: you own the `nodes` and `edges` arrays and
 * feed changes back in through `onNodesChange` / `onEdgesChange`.
 *
 * For best results use ReactFlow in conjunction with `useNodesState`,
 * `useEdgesState`, and the built-in child components (Background, Controls,
 * MiniMap, Panel).
 *
 * The component MUST have a parent with an explicit width and height, or the
 * canvas will collapse to zero size.
 *
 * Anything that needs `useReactFlow` outside of the <ReactFlow> subtree must be
 * wrapped in <ReactFlowProvider>.
 *
 *
 *
 * Graph Data:
 * - nodes: Array of nodes to render. Controlled.
 * - edges: Array of edges to render. Controlled.
 * - defaultNodes: Initial nodes for an UNcontrolled flow.
 * - defaultEdges: Initial edges for an UNcontrolled flow.
 * - defaultEdgeOptions: Defaults merged into every newly created edge
 *       (for example `{ type: 'smoothstep', animated: true }`).
 * - nodeTypes: Map of type name -> component. Defaults: input, default,
 *       output, group. MUST be defined outside the component or memoized.
 * - edgeTypes: Map of type name -> component. Defaults: default (bezier),
 *       straight, step, smoothstep, simplebezier. Same memoization rule.
 *
 *
 * Change Handlers (how a controlled flow stays in sync):
 * - onNodesChange: Fires on node drag, select, resize, and remove.
 * - onEdgesChange: Fires on edge select and remove.
 * - onConnect: Fires when the user completes a new connection. Use `addEdge`.
 * - onConnectStart / onConnectEnd: Start and end of dragging a connection line.
 *       onConnectEnd fires even when the connection was not valid.
 * - onReconnect: Fires when an existing edge endpoint is dragged. Use
 *       `reconnectEdge`. Requires `edgesReconnectable` (default true).
 * - onReconnectStart / onReconnectEnd: Bookends for the above.
 * - onNodesDelete / onEdgesDelete / onDelete: Fire AFTER removal.
 * - onBeforeDelete: Fires BEFORE removal. Return false to cancel the delete,
 *       or return modified nodes/edges to change what gets removed.
 * - onInit: Fires once the viewport is ready; gives you the flow instance.
 * - onSelectionChange: Fires when the set of selected elements changes.
 * - onError: Called instead of throwing when React Flow hits an error.
 * - isValidConnection: Return false to reject a connection before it is made.
 *
 *
 * Viewport, Pan & Zoom:
 * - fitView: Zoom/pan to fit all nodes on first render.
 * - fitViewOptions: `{ padding, minZoom, maxZoom, duration, nodes }`.
 * - defaultViewport: Starting `{ x, y, zoom }`. Ignored when fitView is set.
 * - viewport + onViewportChange: Use both to fully control the viewport.
 * - minZoom: Default 0.5.
 * - maxZoom: Default 2.
 * - translateExtent: Pan boundary as [[minX, minY], [maxX, maxY]].
 * - nodeExtent: Boundary that nodes may be placed within.
 * - panOnDrag: Drag the pane to pan. Default true. Pass an array of mouse
 *       buttons to restrict it, for example [1, 2] = middle/right only.
 * - panOnScroll: Scroll wheel/trackpad pans instead of zooms. Default false.
 * - panOnScrollSpeed: Default 0.5.
 * - panOnScrollMode: 'free' | 'horizontal' | 'vertical'. Default 'free'.
 * - zoomOnScroll: Default true. Turn off when using panOnScroll.
 * - zoomOnPinch: Default true.
 * - zoomOnDoubleClick: Default true.
 * - preventScrolling: Default true. Set false to let the page scroll normally
 *       while the pointer is over the canvas.
 * - onMove / onMoveStart / onMoveEnd: Pan and zoom lifecycle.
 * - width / height: Fixed pixel size instead of filling the parent.
 *
 *
 * Selection:
 * - elementsSelectable: Default true.
 * - selectionOnDrag: Drag the pane to box-select without holding a modifier.
 *       Pair with `panOnDrag={[1, 2]}` so panning is still reachable.
 * - selectionMode: 'full' (default) requires the node to be fully inside the
 *       box; 'partial' selects anything the box touches.
 * - selectNodesOnDrag: Default true.
 * - onSelectionStart / onSelectionEnd: Box drawing lifecycle.
 * - onSelectionDragStart / onSelectionDrag / onSelectionDragStop: Moving a
 *       multi-selection.
 * - onSelectionContextMenu: Right-click on a selection.
 * - elevateNodesOnSelect: Raise z-index of selected nodes. Default true.
 * - elevateEdgesOnSelect: Same for edges. Default false.
 *
 *
 * Keyboard:
 * - deleteKeyCode: Default 'Backspace'. Accepts an array. null disables.
 * - selectionKeyCode: Hold to box-select. Default 'Shift'.
 * - multiSelectionKeyCode: Hold to add to a selection by clicking.
 *       Default 'Meta' on macOS, 'Control' elsewhere.
 * - panActivationKeyCode: Hold to pan. Default 'Space'.
 * - zoomActivationKeyCode: Hold to zoom. Default 'Meta' / 'Control'.
 * - disableKeyboardA11y: Turns off arrow-key movement and tab focus.
 *
 *
 * Connections:
 * - connectionMode: 'strict' (default, source -> target only) or 'loose'
 *       (any handle to any handle). Loose is required for floating edges.
 * - connectionLineType: Path shape of the in-progress line. Default bezier.
 * - connectionLineComponent: Custom component for the in-progress line.
 * - connectionLineStyle / connectionLineContainerStyle: Inline styling.
 * - connectionRadius: Snap distance to a handle when dropping. Default 20.
 * - connectionDragThreshold: Pixels before a drag becomes a connection.
 *       Default 1.
 * - connectOnClick: Click a source handle then a target handle instead of
 *       dragging. Default true.
 * - reconnectRadius: Grab distance for an edge endpoint. Default 10.
 * - edgesReconnectable: Default true. Needs an onReconnect handler to do
 *       anything.
 * - autoPanOnConnect: Pan when the cursor nears the edge of the viewport while
 *       connecting. Default true.
 *
 *
 * Node Interaction:
 * - nodesDraggable: Default true. Override per node with `node.draggable`.
 * - nodesConnectable: Default true. Override with `node.connectable`.
 * - nodesFocusable / edgesFocusable: Tab navigation. Default true.
 * - nodeOrigin: Which point of a node its position refers to.
 *       [0, 0] top-left (default), [0.5, 0.5] center, [1, 1] bottom-right.
 * - nodeDragThreshold: Pixels before a drag starts. Default 1 (so a click is
 *       not treated as a drag).
 * - snapToGrid + snapGrid: Snap dragged nodes to a grid, e.g. [20, 20].
 * - autoPanOnNodeDrag: Default true.
 * - autoPanOnNodeFocus: Default true.
 * - autoPanOnSelection: Default true.
 * - autoPanSpeed: Default 15.
 * - onNodeClick / onNodeDoubleClick / onNodeContextMenu
 * - onNodeMouseEnter / onNodeMouseMove / onNodeMouseLeave
 * - onNodeDragStart / onNodeDrag / onNodeDragStop
 * - nodeClickDistance: Pixels of movement still counted as a click. Default 0.
 *
 *
 * Edge Interaction:
 * - onEdgeClick / onEdgeDoubleClick / onEdgeContextMenu
 * - onEdgeMouseEnter / onEdgeMouseMove / onEdgeMouseLeave
 * - defaultMarkerColor: Arrowhead color. Default '#b1b1b7'.
 *
 *
 * Pane Events:
 * - onPaneClick / onPaneContextMenu / onPaneScroll
 * - onPaneMouseEnter / onPaneMouseMove / onPaneMouseLeave
 * - paneClickDistance: Pixels of movement still counted as a click. Default 0.
 *
 *
 * Presentation & Misc:
 * - proOptions: `{ hideAttribution: true }`. Only legal with a Pro license.
 * - attributionPosition: Where the attribution sits. Default 'bottom-right'.
 * - colorMode: 'light' (default) | 'dark' | 'system'.
 * - onlyRenderVisibleElements: Virtualization for very large graphs.
 *       Default false; adds overhead on small graphs.
 * - zIndexMode: 'basic' (default) | 'auto' (needed for sub flows) | 'manual'.
 * - ariaLabelConfig: Override built-in ARIA strings for localization.
 * - debug: Log fired events to the console. Default false.
 *
 *
 * Escape-hatch Class Names (put these on elements inside a custom node):
 * - "nodrag": Element will not start a node drag. Rename via noDragClassName.
 * - "nowheel": Element scrolls instead of zooming. Rename via noWheelClassName.
 * - "nopan": Element will not pan the viewport. Rename via noPanClassName.
 *
 *
 * Child Components (render as children of <ReactFlow>):
 * - <Background />: Dots, lines, or cross pattern.
 * - <Controls />: Zoom in/out, fit view, and lock buttons.
 * - <MiniMap />: Overview map of the whole graph.
 * - <Panel position="top-left">: Pins arbitrary UI over the canvas.
 * - <ViewportPortal>: Renders children in FLOW coordinates, so they pan and
 *       zoom with the graph. Useful for guides and overlays.
 *
 *
 * Common Hooks:
 * - useNodesState / useEdgesState: State plus a ready-made change handler.
 * - useReactFlow: The instance. getNodes, setNodes, addNodes, deleteElements,
 *       getIntersectingNodes, getInternalNode, screenToFlowPosition, fitView,
 *       updateNodeData, toObject, and more.
 * - useInternalNode: Measured size and absolute position of a node.
 * - useConnection: State of the in-progress connection.
 * - useNodeConnections / useNodesData: React to what a node is wired to.
 * - useKeyPress: Watch a key or chord, e.g. useKeyPress(['Meta+z']).
 * - useUpdateNodeInternals: Call after adding/moving handles at runtime.
 *
 *
 * Common Utils:
 * - addEdge(connection, edges): Use inside onConnect.
 * - reconnectEdge(oldEdge, connection, edges): Use inside onReconnect.
 * - applyNodeChanges / applyEdgeChanges: Manual alternative to the state hooks.
 * - getBezierPath / getSmoothStepPath / getStraightPath: Build custom edges.
 * - getIncomers / getOutgoers / getConnectedEdges / getNodesBounds.
 *
 *
 *
 * Example usage:
 *
 * import {
 *     Background,
 *     Controls,
 *     ReactFlow,
 *     addEdge,
 *     useEdgesState,
 *     useNodesState,
 *     type Connection,
 * } from '@xyflow/react'
 * import '@xyflow/react/dist/style.css'
 *
 *
 * const nodeTypes = { custom: CustomNode }
 *
 * const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
 * const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
 *
 * const onConnect = useCallback(
 *     (connection: Connection) =>
 *         setEdges((edges) => addEdge(connection, edges)),
 *     [setEdges]
 * )
 *
 *
 * <div style={{ width: '100%', height: '600px' }}>
 *     <ReactFlow
 *         nodes={nodes}
 *         edges={edges}
 *         nodeTypes={nodeTypes}
 *         onNodesChange={onNodesChange}
 *         onEdgesChange={onEdgesChange}
 *         onConnect={onConnect}
 *         panOnScroll
 *         fitView
 *     >
 *         <Background />
 *         <Controls />
 *     </ReactFlow>
 * </div>
 *
 */
