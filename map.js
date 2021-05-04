var treeData = localStorage.getItem("map") ? localStorage.getItem("map") :
    `{
            "name": "Root"
        }`;

var levelWidth = [1];
var childCount = function (level, n) {
    if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1]++;
        n.children.forEach(function (d) {
            childCount(level + 1, d);
        });
    }
};

var margin = { top: 40, right: 90, bottom: 50, left: 200 },
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

var nodes, svg;
function init() {
    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom),
        g = svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    var i = 0;
    nodes = d3.hierarchy(JSON.parse(treeData));
}

function draw() {
    levelWidth = [1];
    childCount(0, nodes);
    var newHeight = levelWidth.length * 160;
    console.log(levelWidth);
    // declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([width, newHeight]);
    d3.select('svg')
        .attr('width', newHeight + margin.left + margin.right);

    //  assigns the data to a hierarchy using parent-child relationships


    // maps the node data to the tree layout
    nodes = treemap(nodes);

    var nodesy = svg.selectAll('g.node');
    var linksy = svg.selectAll('.link');
    // adds the links between the nodes
    var link = g.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function (d) {
            return "M" + (d.y - 150) + "," + (d.x + 15)
                + "C" + (((d.y + d.parent.y) / 2) - 75) + "," + (d.x + 15)
                + " " + (((d.y + d.parent.y) / 2) - 75) + "," + (d.parent.x + 15)
                + " " + d.parent.y + "," + (d.parent.x + 15);
        });

    // adds each node as a group
    var node = g.selectAll(".node")
        .data(nodes.descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return "node" +
                (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        })
        .on('dblclick', dblclick)
        .on("contextmenu", click);
    // .on('click', click);

    // adds the circle to the node
    node.append("rect")
        .transition().duration(500).attr('width', 150)
        .attr('height', 30)
        .style('fill', 'white')
        .attr('stroke', function (d) { return d.depth % 2 == 0 ? 'black' : 'red'; })
        .attr('rx', 5)
        .attr('x', -150)

    // adds the text to the node
    node.append("text")
        .attr("dy", ".35em")
        .attr("y", 15)
        .attr("x", -75)
        .style("text-anchor", "middle")
        .text(function (d) { return d.data.name; });

    var allNodes = node.merge(nodesy);
    allNodes.merge(nodesy).transition()
        .duration(500)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    allNodes.select("text")
        .text(function (d) { return d.data.name; })
    allNodes.select("rect")
        .attr('stroke', function (d) { return d.depth % 2 == 0 ? 'black' : 'red'; })

    var allLinks = link.merge(linksy);

    allLinks.transition()
        .duration(500)
        .attr('d', function (d) { return diagonal(d, d.parent) });

}

function diagonal(s, d) {

    path = `M ${s.y - 150} ${s.x + 15}
        C ${((s.y + d.y) / 2) - 75} ${s.x + 15},
          ${((s.y + d.y) / 2) - 75} ${d.x + 15},
          ${d.y} ${d.x + 15}`

    return path
}

function click(event, d) {
    event.preventDefault();
    if (!d.children) {
        d.children = [];
        d.height = 0;
        tmp = d;
        while (tmp) {
            tmp.height++;
            tmp = tmp.parent
        }
    }
    var newNode = window.prompt("New node: ");
    if (newNode) {
        d.children.push(
            {
                data: {
                    name: newNode
                },
                parent: d,
                depth: d.depth + 1,
                height: 0
            });
        draw()
        localStorage.setItem("map", JSON.stringify(traverseTree(nodes, {})));
    }
}

function dblclick(event, d) {
    var edited = window.prompt("Edit node: ", d.data.name);
    if (edited) {
        d.data.name = edited;
        draw()
        localStorage.setItem("map", JSON.stringify(traverseTree(nodes, {})));
    }
}