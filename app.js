var app = angular.module('app', ['$jsPlumb']);

app.directive('start', function (jsPlumbFactory) {
  return jsPlumbFactory.node({
    templateUrl: "start_template.tpl",
    link: function (scope, element) {
      element.addClass("flowchart-object flowchart-start");
    }
  });
});

app.directive('question', function (jsPlumbFactory) {
  return jsPlumbFactory.node({
    inherit: ["removeNode", "editNode"],
    templateUrl: "question_template.tpl",
    link: function (scope, element) {
      element.addClass("flowchart-object flowchart-question");
    }
  });
});

app.directive('action', function (jsPlumbFactory) {
  return jsPlumbFactory.node({
    inherit: ["removeNode", "editNode"],
    templateUrl: "action_template.tpl",
    link: function (scope, element) {
      element.addClass("flowchart-object flowchart-action");
    }
  });
});

app.directive('output', function (jsPlumbFactory) {
  return jsPlumbFactory.node({
    inherit: ["removeNode", "editNode"],
    templateUrl: "output_template.tpl",
    link: function (scope, element) {
      element.addClass("flowchart-object flowchart-output");
    }
  });
});


app.controller("DemoController", function ($log, $scope, jsPlumbService) {
  var ctrl = this;

  // toolkit id
  var toolkitId = "flowchartToolkit";
  var toolkit;

  window.jsps = jsPlumbService;
  window.ctrl = this;

  // ---------------------------- operations on nodes, edges ---------------------------------------------------------

  var _editLabel = function (edge) {
    jsPlumbToolkit.Dialogs.show({
      id: "dlgText",
      data: {
        text: edge.data.label || ""
      },
      onOK: function (data) {
        toolkit.updateEdge(edge, { label: data.text });
      }
    });
  };

  // ---------------------------- / operations on nodes, edges ---------------------------------------------------------

  //
  // scope contains
  // jtk - the toolkit
  // surface - the surface
  //
  // element is the DOM element into which the toolkit was rendered
  //
  this.init = function (scope, element, attrs) {

    toolkit = scope.toolkit;

    toolkit.load({
      url: "data/data.json"
    });

    // -------------- configure buttons --------------------------------

    var controls = element[0].querySelector(".controls");

    // pan mode/select mode
    jsPlumb.on(controls, "tap", "[mode]", function () {
      scope.surface.setMode(this.getAttribute("mode"));
    });

    // on home button click, zoom content to fit.
    jsPlumb.on(controls, "tap", "[reset]", function () {
      scope.toolkit.clearSelection();
      scope.surface.zoomToFit();
    });

    // configure Drawing tools. This is an optional include.
    new jsPlumbToolkit.DrawingTools({
      renderer: scope.surface
    });

    // initialize dialogs
    jsPlumbToolkit.Dialogs.initialize({
      selector: ".dlg"
    });

    //
    // any operation that caused a data update (and would have caused an autosave), fires a dataUpdated event.
    //
    new jsPlumbSyntaxHighlighter(toolkit, ".jtk-demo-dataset");
  };

  // ----------------------------- data for the app ----------------------------------------------------------

  $scope.nodeTypes = [
    { label: "Question", type: "question" },
    { label: "Action", type: "action" },
    { label: "Output", type: "output" }
  ];

  $scope.removeNode = function (node) {
    var info = this.surface.getObjectInfo(node);
    jsPlumbToolkit.Dialogs.show({
      id: "dlgConfirm",
      data: {
        msg: "Delete '" + info.obj.data.text + "'"
      },
      onOK: function () {
        toolkit.removeNode(info.obj);
      }
    });
  };

  $scope.editNode = function (node) {
    // getObjectInfo is a method that takes some DOM element (this function's `this` is
    // set to the element that fired the event) and returns the toolkit data object that
    // relates to the element. it ascends through parent nodes until it finds a node that is
    // registered with the toolkit.
    var info = this.surface.getObjectInfo(node);
    jsPlumbToolkit.Dialogs.show({
      id: "dlgText",
      data: info.obj.data,
      title: "Edit " + info.obj.type + " name",
      onOK: function (data) {
        if (data.text && data.text.length > 2) {
          // if name is at least 2 chars long, update the underlying data and
          // update the UI.
          toolkit.updateNode(info.obj, data);
        }
      }
    });
  };

  // -------------------------------- render parameters ---------------------------------------------------

  this.typeExtractor = function (el) {
    return el.getAttribute("jtk-node-type");
  };

  /**
   * This is wired into the jsplumb-palette, and called whenever a new node is dropped onto the surface.
   * @param node
   */
  this.onDrop = function (node) {
    console.log("A node was dropped: " + node.id);
  };

  var nodeDimensions = {
    question: { w: 120, h: 120 },
    action: { w: 120, h: 70 },
    start: { w: 50, h: 50 },
    output: { w: 120, h: 70 }
  };

  this.toolkitParams = {
    nodeFactory: function (type, data, callback) {
      jsPlumbToolkit.Dialogs.show({
        id: "dlgText",
        title: "Enter " + type + " name:",
        onOK: function (d) {
          data.text = d.text;
          // if the user entered a name...
          if (data.text) {
            // and it was at least 2 chars
            if (data.text.length >= 2) {
              // set width and height.
              jsPlumb.extend(data, nodeDimensions[type]);
              // set an id and continue.
              data.id = jsPlumbToolkitUtil.uuid();
              callback(data);
            }
            else
              // else advise the user.
              alert(type + " names must be at least 2 characters!");
          }
          // else...do not proceed.
        }
      });
    },
    beforeStartConnect: function (node, edgeType) {
      return { label: "..." };
    }
  };

  this.renderParams = {
    view: {
      nodes: {
        "start": { template: "start" },
        "selectable": {
          events: {
            tap: function (params) {
              toolkit.toggleSelection(params.node);
            }
          }
        },
        "question": {
          parent: "selectable",
          template: "question"
        },
        "action": {
          parent: "selectable",
          template: "action"
        },
        "output": {
          parent: "selectable",
          template: "output"
        }
      },
      // There are two edge types defined - 'yes' and 'no', sharing a common
      // parent.
      edges: {
        "default": {
          anchor: "AutoDefault",
          endpoint: "Blank",
          connector: ["Flowchart", { cornerRadius: 5 }],
          paintStyle: { strokeWidth: 2, stroke: "#f76258", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
          hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
          events: {
            "dblclick": function (params) {
              jsPlumbToolkit.Dialogs.show({
                id: "dlgConfirm",
                data: {
                  msg: "Delete Edge"
                },
                onOK: function () {
                  toolkit.removeEdge(params.edge);
                }
              });
            }
          },
          overlays: [
            ["Arrow", { location: 1, width: 10, length: 10 }],
            ["Arrow", { location: 0.3, width: 10, length: 10 }]
          ]
        },
        "connection": {
          parent: "default",
          overlays: [
            [
              "Label", {
                label: "${label}",
                events: {
                  click: function (params) {
                    _editLabel(params.edge);
                  }
                }
              }
            ]
          ]
        }
      },

      ports: {
        "start": {
          endpoint: "Blank",
          anchor: "Continuous",
          uniqueEndpoint: true,
          edgeType: "default"
        },
        "source": {
          endpoint: "Blank",
          paintStyle: { fill: "#84acb3" },
          anchor: "AutoDefault",
          maxConnections: -1,
          edgeType: "connection"
        },
        "target": {
          maxConnections: -1,
          endpoint: "Blank",
          anchor: "AutoDefault",
          paintStyle: { fill: "#84acb3" },
          isTarget: true
        }
      }
    },
    // Layout the nodes using an absolute layout
    layout: {
      type: "Absolute"
    },
    events: {
      canvasClick: function (e) {
        toolkit.clearSelection();
      },
      edgeAdded: function (params) {
        if (params.addedByMouse) {
          _editLabel(params.edge);
        }
      },
      // listener for mode change on renderer.
      modeChanged: function (mode) {
        var controls = document.querySelector(".controls");
        jsPlumb.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
        jsPlumb.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
      },
      click: function (e) {
        alert(e)
      }
    },
    consumeRightClick: false,
    dragOptions: {
      filter: ".jtk-draw-handle, .node-action, .node-action i"
    }
  };
});