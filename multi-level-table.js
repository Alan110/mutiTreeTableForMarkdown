! function() {

    //options
    var defaults = {
        supportSearch: true,
    };

    function MultiLevelTable(el, data, option) {
        this.options = extend({}, defaults, option);
        this.el = el || "";
        this.data = modifyData(data) || null;
    };

    MultiLevelTable.prototype.generate = function() {
        var self = this,
            err;
        if (err = checkTable(self)) {
            console.log(err);
            return;
        }
        var target = document.querySelector(self.el);
        target.innerHTML = "<table border='1'>"
            + (self.options.supportSearch
            ? "<div style='margin-bottom: 10px;'><input id='multi-level-table-input-"
            + self.el + "' type='text' /></div>" : "")
            + getTableHead(self)
            + "<tbody id='multi-level-table-tbody-"
            + self.el + "'>" + showAllItems(self)
            + "</tbody></table>";
        var search = document.getElementById("multi-level-table-input-" + self.el);
        if (self.options.supportSearch) {
            search.addEventListener("input", function(){
                showSearchItems(self, search.value);
            });
        }
    };

    // table func
    var modifyData = function (obj) {
        var head = obj['head'],
            content = obj['content'],
            header = arrayMinus(head, 1),
            newContent = {};
            for(var i = 0; i < header.length; ++i){
                newContent[header[i]] = [];
            }
            for(var i = 0; i < content.length; ++i){
                for(var j in content[i]){
                    newContent[j].push(content[i][j]);
                }
            }
            return {
                "head": head,
                "content": newContent
            }
    };

    var checkTable = function (obj) {
        var head = obj.data.head,
            header = arrayMinus(head, 1),
            content = obj.data.content,
            contentLen = getPropertyCount(content);
        if (obj.el === "" || obj.data === null || head.length < 1 || contentLen < 1)
            return "empty data or el";
        if (header.length !== contentLen)
            return "head & content not match";
        for (var i = 0; i < header.length; ++i) {
            if (typeof('' + header[i]) !== "string")
                return "invalid head";
            if (content['' + header[i]] === undefined)
                return "invalid head";
        }
        for (var i = 0; i < head.length; ++i) {
            var len = -1;
            for (var j = 0; j < head[i].length; ++j) {
                if (len < 0)
                    len = content['' + head[i][j]].length;
                else if (len !== content['' + head[i][j]].length)
                    return "content length error";
            }
        }
        return 0;
    };

    var showAllItems = function (self) {
        var head = self.data.head,
            content = self.data.content,
            header = arrayMinus(head, 1),
            len = content['' + header[0]].length,
            bodyHTML = "";
        for (var i = 0; i < len; ++i) {
            var curRow = [],
                curLevel = [],
                level2firstItem = [];
            getCurRowInfo(self, i, curRow, curLevel, level2firstItem);
            var tree = getTree(level2firstItem),
                idSpan = [];
            dfs(tree[0], tree, 0, idSpan);
            bodyHTML += getTableRow(curRow, curLevel, level2firstItem, idSpan);
        }
        return bodyHTML;
    };

    var showSearchItems = function (self, key) {
        var tbody = document.getElementById("multi-level-table-tbody-" + self.el);
        if (key === "") {
            tbody.innerHTML = showAllItems(self);
            return;
        }
        var head = self.data.head,
            content = self.data.content,
            header = arrayMinus(head, 1),
            len = content['' + header[0]].length,
            bodyHTML = "";
        for (var i = 0; i < len; ++i) {
            var curRow = [],
                curLevel = [],
                level2firstItem = [];
            getCurRowInfo(self, i, curRow, curLevel, level2firstItem);
            var tree = getTree(level2firstItem),
                idSpan = [];
            dfs(tree[0], tree, 0, idSpan);
            bodyHTML += getTableRow(curRow, curLevel, level2firstItem, idSpan, key);
        }
        tbody.innerHTML = bodyHTML;
    }

    var getTableRow = function (curRow, curLevel, level2firstItem, idSpan, key) {
        if (key !== undefined && ("" + curRow[0]).indexOf(key) === -1)
            return "";
        var q = [],
            qCol = [],
            idValues = [],
            curRowOne = [],
            id = 0;
        for (var i = 0; i < level2firstItem.length; ++i) {
            q.push([]);
            qCol.push(0);
            var item = arrayMinus([level2firstItem[i]], i);
            for (var j = 0; j < item.length; ++j) {
                q[i].push(id++);
            }
        }
        for (var i = 0; i < curRow.length; ++i) {
            curRowOne.push(arrayMinus([curRow[i]], curLevel[i]));
        }
        for (var i = 0; i < curRowOne.length; ++i) {
            if (i === 0 || curLevel[i] !== curLevel[i - 1]) {
                var res = [],
                    j = 0;
                for (; j < curRowOne[i].length; ++j)
                    res.push([]);
                for (j = i; curLevel[j] === curLevel[i]; ++j) {
                    for (var k = 0; k < curRowOne[j].length; ++k) {
                        res[k].push(curRowOne[j][k]);
                    }
                }
                for (var k = 0; k < res.length; ++k) {
                    idValues.push(res[k]);
                }
                i = j - 1;
            }
        }
        var res = "";
        for (var i = 1; i <= idSpan[0]; ++i) {
            var col = "";
            for (var j = 0; j < q.length; ++j) {
                if (q[j].length < 1) continue;
                var tp = q[j][0];
                if (qCol[j] < i) {
                    qCol[j] += idSpan[tp];
                    q[j].shift();
                    for (var k = 0; k < idValues[tp].length; ++k) {
                        col += "<td rowspan='" + idSpan[tp] + "'>" + idValues[tp][k] + "</td>";
                    }
                }
            }
            col = "<tr>" + col + "</tr>";
            res += col;
        }
        return res;
    }

    var getCurRowInfo = function (self, idx, curRow, curLevel, level2firstItem) {
        var head = self.data.head,
            content = self.data.content;
        for (var j = 0; j < head.length; ++j) {
            level2firstItem.push(content['' + head[j][0]][idx]);
            for (var k = 0; k < head[j].length; ++k) {
                curLevel.push(j);
                curRow.push(content['' + head[j][k]][idx]);
            }
        }
    }

    var getTableHead = function (self) {
        var head = self.data.head,
            header = arrayMinus(head, 1),
            res = "";
        for (var i = 0; i < header.length; ++i) {
            res += "<th>" + header[i] + "</th>";
        }
        res = "<tr>" + res + "</tr>";
        res = "<thead>" + res + "</thead>";
        if (self.options.title !== undefined) {
            res = "<caption>" + self.options.title + "</caption>" + res;
        }
        return res;
    }

    //tree

    function node (children) {
        this.children = children;
    }

    var getTree = function (levelItem) {
        var tree = [];
        if (levelItem.length < 1) return tree;
        tree.push(new node([]));
        if (levelItem.length < 2) return tree;
        for (var i = 0; i < levelItem[1].length; ++i) {
            tree.push(new node([]));
            tree[0].children.push(tree.length - 1);
        }
        for (var i = 2; i < levelItem.length; ++i) {
            var preItem = arrayMinus(levelItem[i - 1], i - 3),
                item = arrayMinus(levelItem[i], i - 2),
                preLen = tree.length;
            for (var j = 0; j < preItem.length; ++j) {
                for (var k = 0; k < item[j].length; ++k) {
                    tree.push(new node([]));
                    tree[preLen - preItem.length + j].children.push(tree.length - 1);
                }
            }
        }
        return tree;
    }

    var dfs = function (root, tree, id, idSpan) {
        if (root.children.length === 0)
            return idSpan[id] = 1;
        idSpan[id] = 0;
        for (var i = 0; i < root.children.length; ++i) {
            idSpan[id] += dfs(tree[root.children[i]], tree, root.children[i], idSpan);
        }
        return idSpan[id];
    }

    //utils
    var arrayMinus = function (arr, k) {
        var res = arr;
        for (var i = 0; i < k; ++i)
            res = Array.prototype.concat.apply([], res);
        return res;
    };

    var extend = function (merged) {
        var sources = [].slice.call(arguments, 1);
        for (var i = 0; i < sources.length; i++) {
            for (var property in sources[i]) {
                merged[property] = sources[i][property];
            }
        }
        return merged;
    };

    var getPropertyCount = function (o) {
        var n, count = 0;
        for (n in o) {
            if (o.hasOwnProperty(n)) {
                count++;
            }
        }
        return count;
    }

    //register
    window.MultiLevelTable = MultiLevelTable;
}();
