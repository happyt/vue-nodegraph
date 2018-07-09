Just playing around with some touch libraries
https://codepen.io/xgundam05/pen/WbxdxZ

test some css on the html version
add some svg

draw curves
M = moveto
L = lineto
H = horizontal lineto
V = vertical lineto
C = curveto
S = smooth curveto
Q = quadratic Bézier curve
T = smooth quadratic Bézier curveto
A = elliptical Arc
Z = closepath

Test with half normal and half smooth
C S, Q T

Next need click drag lines to join nodes

Some offsets confusing
https://www.sarasoueidan.com/blog/svg-coordinate-systems/
https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/

Just used a simple diff between coords

Now have line dragging

Next drop to a point and get the event

After need to put together the overall structure of DOM elements, circle elements and lines

