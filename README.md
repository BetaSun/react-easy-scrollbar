# react-easy-scrollbar

## Properties

| propertyName | description | type | default |
| -- | -- | -- | -- |
| className | the className of container | string | - |
| style | the style of container | object | - |
| autoHide | whether to hide the scrollbar automatically after the mouse leaves the container | boolean | false |
| autoHideDelay | hide delay in ms  | number | 1000 |
| autoHideDuration | duration for hide animation in ms | object | 200 |

## Methods

| methodName | description |
| -- | -- |
| scrollTop(top = 0) | scroll to the top value |
| scrollLeft(left = 0) | scroll to the left value |
| scrollToTop() | scroll to top |
| scrollToBottom() | scroll to bottom |
| scrollToLeft() | scroll to left |
| scrollToRight() | scroll to right |
| getScrollLeft() | get scrollLeft value |
| getScrollTop() | get scrollTop value |
| getScrollWidth() | get scrollWidth value |
| getScrollHeight() | get scrollHeight value |
| getClientWidth() | get view client width |
| getClientHeight() | get view client height |
| getValues() | get an object with values about the current position |

## Installation

```
npm install react-easy-scrollbar --save
```

## Usage

```
import Scrollbar from 'react-easy-scrollbar';
function ScrollbarExample() {
	return (
		<Scrollbar
			className="test"
			style={{ height: 600 }}
			autoHide
			autoHideDelay={0}
			autoHideDuration={1000}
			ref={(scrollbar) => this.scrollbar = scrollbar}
		>
		{...Array(100).keys()}.map((index) => (<div key={index} onClick={() => this.scrollbar.scrollTop(index)}>{index}</div>))}
		</Scrollbar>
	);
}

```