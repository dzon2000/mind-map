function traverseTree(n, d) {
    d.name = n.data.name;
    d.children = [];
    if (n.children) {
        for (var ch of n.children) {
            d.children.push(traverseTree(ch, {}));
        }
    }
    return d;
}