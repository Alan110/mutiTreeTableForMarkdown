
# 多级table

feature:
* json作为数据不用拼表格
* 可以筛选

# 使用例子

```javascript
var data = {
	head : [
		[
		    "ss",
		    "ss Desc."
		],
		[
		    "gg",
		    "gg Desc."
		]
	],
	content : [
		{
			"ss": "1",
			"ss Desc.": "美女直达专用",
			"gg": [
				1,
				2,
				3,
				4,
				5,
				6,
				7
			],
			"gg Desc.": [
				"美女直达专用",
				"美女直达专用",
				"美女直达专用",
				"美女直达专用",
				"美女直达专用",
				"美女直达专用",
				"美女直达专用"
			]
		}
	
	]
};

new MultiLevelTable("#el", data).generate();

```

head 是表头，每一组为一个数组

content 每一个对象为一行。当一个字段为多行时，为数组。

