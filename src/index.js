import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import './index.less';

const PREFIX = 'react-easy-scrollbar';
const DEBOUNCE_RESIZE_DELAY = 100;
const DEBOUNCE_RESIZE_MAX_DELAY = 300;
const DEFAULT_AUTO_HIDE_DELAY = 1000;
const DEFAULT_AUTO_HIDE_DURATION = 200;

/**
 * @description 自定义滚动条
 * @author BetaSun
 * @version 2019-05-21
 */
export default class ReactEasyScrollbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: +!props.autoHide,
      mouseEnter: false,
      mouseDown: false,
      horizontalThumbWidth: 0,
      horizontalVisible: true,
      horizontalThumbOffset: 0,
      verticalThumbHeight: 0,
      verticalVisible: true,
      verticalThumbOffset: 0,
    };
    this.opacityTransitionFrame = null;
    this.opacityTransitionDelayTimer = null;
    this.prevMouseEventClientX = null;
    this.prevMouseEventClientY = null;
    this.prevHorizontalThumbOffset = null;
    this.prevVerticalThumbOffset = null;
    this.wrapper = null;
    this.horizontalTrack = null;
    this.verticalTrack = null;
    this.setWrapperReference = this.setWrapperReference.bind(this);
    this.setHorizontalTrackReference = this.setHorizontalTrackReference.bind(this);
    this.setVerticalTrackReference = this.setVerticalTrackReference.bind(this);
    this.debouncedHandleResize = debounce(this.handleResize.bind(this), DEBOUNCE_RESIZE_DELAY, { maxWait: DEBOUNCE_RESIZE_MAX_DELAY });
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleHorizontalTrackMouseDown = this.handleHorizontalTrackMouseDown.bind(this);
    this.handleHorizontalThumbMouseDown = this.handleHorizontalThumbMouseDown.bind(this);
    this.handleHorizontalMouseMove = this.handleHorizontalMouseMove.bind(this);
    this.handleHorizontalMouseUp = this.handleHorizontalMouseUp.bind(this);
    this.handleVerticalTrackMouseDown = this.handleVerticalTrackMouseDown.bind(this);
    this.handleVerticalThumbMouseDown = this.handleVerticalThumbMouseDown.bind(this);
    this.handleVerticalMouseMove = this.handleVerticalMouseMove.bind(this);
    this.handleVerticalMouseUp = this.handleVerticalMouseUp.bind(this);
  }

  componentDidMount() {
    this.setThumbStyle();
    window.addEventListener('resize', this.debouncedHandleResize);
  }

  componentDidUpdate({ children: prevChildren }, { mouseEnter: prevMouseEnter, mouseDown: prevMouseDown }) {
    const { children, autoHide, autoHideDelay=DEFAULT_AUTO_HIDE_DELAY } = this.props;
    const { mouseEnter, mouseDown } = this.state;
    if (children !== prevChildren) {
      this.setThumbStyle();
    }
    if (autoHide && ((prevMouseEnter || prevMouseDown) !== (mouseEnter || mouseDown))) {
      clearTimeout(this.opacityTransitionDelayTimer);
      const visible = mouseEnter || mouseDown;
      if (visible) {
        this.setOpacityTransitionFrame(+visible);
      } else {
        this.opacityTransitionDelayTimer = setTimeout(() => {
          this.setOpacityTransitionFrame(+visible);
        }, autoHideDelay);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedHandleResize);
  }

  getScrollLeft() {
    return this.wrapper.scrollLeft;
  }

  getScrollTop() {
    return this.wrapper.scrollTop;
  }

  getScrollWidth() {
    return this.wrapper.scrollWidth;
  }

  getScrollHeight() {
    return this.wrapper.scrollHeight;
  }

  getClientWidth() {
    return this.wrapper.clientWidth;
  }

  getClientHeight() {
    return this.wrapper.clientHeight;
  }

  getValues() {
    const {
      scrollLeft,
      scrollTop,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
    } = this.wrapper;
    return {
      scrollLeft,
      scrollTop,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
    };
  }

  getHorizontalThumbOffset() {
    const {
      scrollWidth,
      scrollLeft,
    } = this.wrapper;
    const {
      clientWidth: horizontalClientWidth,
    } = this.horizontalTrack;
    const horizontalThumbOffset = horizontalClientWidth * scrollLeft / scrollWidth;
    return horizontalThumbOffset;
  }

  getVerticalThumbOffset() {
    const {
      scrollHeight,
      scrollTop,
    } = this.wrapper;
    const {
      clientHeight: veritalClientHeight,
    } = this.verticalTrack;
    const verticalThumbOffset = veritalClientHeight * scrollTop / scrollHeight;
    return verticalThumbOffset;
  }

  setWrapperReference(wrapper) {
    this.wrapper = wrapper;
  }

  setHorizontalTrackReference(horizontalTrack) {
    this.horizontalTrack = horizontalTrack;
  }

  setVerticalTrackReference(verticalTrack) {
    this.verticalTrack = verticalTrack;
  }

  setThumbStyle(){
    const {
      clientWidth,
      scrollWidth,
      clientHeight,
      scrollHeight,
    } = this.wrapper;
    const {
      clientWidth: horizontalClientWidth,
    } = this.horizontalTrack;
    const {
      clientHeight: veritalClientHeight,
    } = this.verticalTrack;
    const horizontalPercent = clientWidth / scrollWidth;
    const veritalPercent = clientHeight / scrollHeight;
    this.setState({
      horizontalThumbWidth: horizontalClientWidth * horizontalPercent,
      horizontalVisible: horizontalPercent !== 1,
      horizontalThumbOffset: this.getHorizontalThumbOffset(),
      verticalThumbHeight: veritalClientHeight * veritalPercent,
      verticalVisible: veritalPercent !== 1,
      verticalThumbOffset: this.getVerticalThumbOffset(),
    });
  }

  setOpacityTransitionFrame(nextOpacity) {
    window.cancelAnimationFrame(this.opacityTransitionFrame);
    let start = null;
    const { autoHideDuration=DEFAULT_AUTO_HIDE_DURATION } = this.props;
    const { opacity: prevOpacity } = this.state;
    const callback = (timestamp) => {
      if (!start) {
        start = timestamp;
      }
      const progress = timestamp - start;
      this.setState({ opacity: prevOpacity + (nextOpacity - prevOpacity) * Math.min(progress / autoHideDuration, 1) });
      if (progress < autoHideDuration) {
        this.opacityTransitionFrame = window.requestAnimationFrame(callback);
      }
    };
    this.opacityTransitionFrame = window.requestAnimationFrame(callback);
  }

  scrollLeft(left = 0) {
    this.wrapper.scrollLeft = left;
    this.setState({ horizontalThumbOffset: this.getHorizontalThumbOffset() });
  }

  scrollToLeft() {
    this.scrollLeft();
  }

  scrollToRight() {
    this.scrollLeft(this.wrapper.scrollWidth);
  }

  scrollTop(top = 0) {
    this.wrapper.scrollTop = top;
    this.setState({ verticalThumbOffset: this.getVerticalThumbOffset() });
  }

  scrollToTop() {
    this.scrollTop();
  }

  scrollToBottom() {
    this.scrollTop(this.wrapper.scrollHeight);
  }

  handleResize() {
    this.setThumbStyle();
  }

  handleMouseEnter() {
    this.setState({ mouseEnter: true });
  }

  handleMouseLeave() {
    this.setState({ mouseEnter: false });
  }

  handleMouseWheel(e) {
    const {
      clientHeight,
      scrollHeight,
      scrollTop,
    } = this.wrapper;
    const offset = e.deltaY;
    this.scrollTop(scrollTop + offset);
    if (scrollTop > 0 && offset < 0 || scrollTop < scrollHeight - clientHeight && offset > 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleHorizontalTrackMouseDown(e) {
    const { horizontalThumbWidth } = this.state;
    const { clientX } = e;
    const { left, right } = this.verticalTrack.getBoundingClientRect();
    const { scrollWidth } = this.wrapper;
    this.scrollTop((clientX - left - horizontalThumbWidth / 2) / (right - left) * scrollWidth);
  }

  handleHorizontalThumbMouseDown(e) {
    e.stopPropagation();
    this.prevMouseEventClientX = e.clientX;
    ({ horizontalThumbOffset: this.prevHorizontalThumbOffset } = this.state);
    this.setState({ mouseDown: true });
    window.addEventListener('mouseup', this.handleHorizontalMouseUp);
    window.addEventListener('mousemove', this.handleHorizontalMouseMove);
  }

  handleHorizontalMouseMove(e) {
    const offset = e.clientX - this.prevMouseEventClientX;
    const { clientWidth, scrollWidth } = this.wrapper;
    const { clientWidth: horizontalClientWidth } = this.horizontalTrack;
    this.scrollLeft(scrollWidth * Math.min(Math.max((this.prevHorizontalThumbOffset + offset) / horizontalClientWidth, 0), (1 - clientWidth / scrollWidth)));
  }

  handleHorizontalMouseUp() {
    this.prevMouseEventClientX = null;
    this.prevHorizontalThumbOffset = null;
    this.setState({ mouseDown: false });
    window.removeEventListener('mouseup', this.handleHorizontalMouseUp);
    window.removeEventListener('mousemove', this.handleHorizontalMouseMove);
  }

  handleVerticalTrackMouseDown(e) {
    const { verticalThumbHeight } = this.state;
    const { clientY } = e;
    const { top, bottom } = this.verticalTrack.getBoundingClientRect();
    const { scrollHeight } = this.wrapper;
    this.scrollTop((clientY - top - verticalThumbHeight / 2) / (bottom - top) * scrollHeight);
  }

  handleVerticalThumbMouseDown(e) {
    e.stopPropagation();
    this.prevMouseEventClientY = e.clientY;
    ({ verticalThumbOffset: this.prevVerticalThumbOffset } = this.state);
    this.setState({ mouseDown: true });
    window.addEventListener('mouseup', this.handleVerticalMouseUp);
    window.addEventListener('mousemove', this.handleVerticalMouseMove);
  }

  handleVerticalMouseMove(e) {
    const offset = e.clientY - this.prevMouseEventClientY;
    const { clientHeight, scrollHeight } = this.wrapper;
    const { clientHeight: veritalClientHeight } = this.verticalTrack;
    this.scrollTop(scrollHeight * Math.min(Math.max((this.prevVerticalThumbOffset + offset) / veritalClientHeight, 0), (1 - clientHeight / scrollHeight)));
  }

  handleVerticalMouseUp() {
    this.prevMouseEventClientY = null;
    this.prevVerticalThumbOffset = null;
    this.setState({ mouseDown: false });
    window.removeEventListener('mouseup', this.handleVerticalMouseUp);
    window.removeEventListener('mousemove', this.handleVerticalMouseMove);
  }

  render() {
    const {
      className,
      style,
      autoHide,
      autoHideDelay,
      autoHideDuration,
      children,
      ...restProps
    } = this.props;
    const {
      opacity,
      horizontalThumbWidth,
      verticalThumbHeight,
      horizontalVisible,
      verticalVisible,
      horizontalThumbOffset,
      verticalThumbOffset,
    } = this.state;
    return (
      <div
        className={[`${PREFIX}-container`, className].filter(c => c).join(' ')}
        style={{ ...style }}
        onMouseEnter={autoHide ? this.handleMouseEnter : undefined}
        onMouseLeave={autoHide ? this.handleMouseLeave : undefined}
        onWheel={this.handleMouseWheel}
        {...restProps}
      >
        <div className={`${PREFIX}-wrapper`} ref={this.setWrapperReference}>{children}</div>
        <div
          className={`${PREFIX}-horizontal-track`}
          style={{ display: horizontalVisible ? undefined : 'none', opacity }}
          ref={this.setHorizontalTrackReference}
          onMouseDown={this.handleHorizontalTrackMouseDown}
        >
          <div
            className={`${PREFIX}-horizontal-thumb`}
            style={{
              width: horizontalThumbWidth,
              left: horizontalThumbOffset,
            }}
            onMouseDown={this.handleHorizontalThumbMouseDown}
          />
        </div>
        <div
          className={`${PREFIX}-vertical-track`}
          style={{ display: verticalVisible ? undefined : 'none', opacity  }}
          ref={this.setVerticalTrackReference}
          onMouseDown={this.handleVerticalTrackMouseDown}
        >
          <div
            className={`${PREFIX}-vertical-thumb`}
            style={{
              height: verticalThumbHeight,
              top: verticalThumbOffset,
            }}
            onMouseDown={this.handleVerticalThumbMouseDown}
          />
        </div>
      </div>
    );
  }
};
