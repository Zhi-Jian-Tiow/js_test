/*
    The goal of this exercise is to take a polygon defined by the points 'points', use the mouse
    events to draw a line that will split the polygon and then draw the two split polygons.
    In the start, you'll have the initial polygon (start.png)
    While dragging the mouse, the polygon should be shown along with the line you're drawing (mouseMove.png)
    After letting go of the mouse, the polygon will be split into two along that line (mouseUp.png)

    The code provided here can be used as a starting point using plain-old-Javascript, but it's fine
    to provide a solution using react/angular/vue/etc if you prefer.
*/

import { useState, useEffect, useRef } from "react";

const App = () => {
  const [startingPoint, setStartingPoint] = useState({});
  const startingPointRef = useRef(startingPoint);
  let mouseDown = false;

  const onMouseDown = (event) => {
    mouseDown = true;
    startingPointRef.current = { x: event.clientX, y: event.clientY };
    setStartingPoint({ x: event.clientX, y: event.clientY });
    addPoly(points, "black");
  };

  const onMouseMove = (event) => {
    if (mouseDown) {
      const newPoint = [event.clientX, event.clientY];
      const content = document.getElementById("content");
      var svgLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      var svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgElement.setAttribute("height", "500");
      svgElement.setAttribute("width", "500");
      svgElement.setAttribute("style", "position: absolute;");
      svgElement.setAttribute("fill", "transparent");

      let linePath =
        "M" + startingPointRef.current.x + " " + startingPointRef.current.y;
      linePath += " L" + newPoint[0] + " " + newPoint[1];

      clearPoly();
      addPoly(points, "black");
      svgLine.setAttribute("stroke", "red");
      svgLine.setAttribute("d", linePath);

      svgElement.appendChild(svgLine);
      content.appendChild(svgElement);
    }
  };

  const onMouseUp = (event) => {
    mouseDown = false;
    const endingPoint = { x: event.clientX, y: event.clientY };

    let intersectionPoints = [];
    let tracker = [];
    let line = {};

    let poly1 = [];
    let poly2 = [];

    // Create a tracker to find intersection point
    for (let i = 0; i < points.length - 1; i++) {
      line.x1 = points[i].x;
      line.y1 = points[i].y;
      line.x2 = points[i + 1].x;
      line.y2 = points[i + 1].y;
      tracker.push(line);
      line = {};
    }
    // To make sure the last line of polygon is pushed to tracker
    tracker.push({
      x1: points[points.length - 1].x,
      y1: points[points.length - 1].y,
      x2: points[0].x,
      y2: points[0].y,
    });

    // Find the intersection point
    for (let i = 0; i < tracker.length; i++) {
      let [t, u] = findIntersection(
        startingPointRef.current.x,
        endingPoint.x,
        tracker[i].x1,
        tracker[i].x2,
        startingPointRef.current.y,
        endingPoint.y,
        tracker[i].y1,
        tracker[i].y2
      );

      const gotIntersection = t >= 0 && t <= 1 && u >= 0 && u <= 1;

      if (gotIntersection) {
        // Calculate the intersection point if got intersection
        let newX =
          startingPointRef.current.x +
          t * (endingPoint.x - startingPointRef.current.x);

        let newY =
          startingPointRef.current.y +
          t * (endingPoint.y - startingPointRef.current.y);

        // Check if the point is in the intersectionPoint array
        if (!intersectionPoints.length) {
          intersectionPoints.push({ x: newX, y: newY });
        } else {
          for (let i = 0; i < intersectionPoints.length; i++) {
            if (
              !Object.values(intersectionPoints[i]).includes(newX) ||
              !Object.values(intersectionPoints[i]).includes(newY)
            ) {
              intersectionPoints.push({ x: newX, y: newY });
            }
          }
        }
      }
    }

    // Check which side the points is at respective to the intersection line
    for (let i = 0; i < points.length; i++) {
      if (intersectionPoints.length > 0) {
        let d =
          (points[i].x - intersectionPoints[0].x) *
            (intersectionPoints[1].y - intersectionPoints[0].y) -
          (points[i].y - intersectionPoints[0].y) *
            (intersectionPoints[1].x - intersectionPoints[0].x);
        if (d < 0) {
          poly1.push(points[i]);
        } else if (d === 0) {
          poly1.push(points[i]);
          poly2.push(points[i]);
        } else {
          poly2.push(points[i]);
        }
      } else {
        console.log("no intersection point");
      }
    }

    // Calculate the distance between each point with the 1st intersection point
    let dist1 = [];
    let dist2 = [];

    for (let i = 0; i < poly1.length; i++) {
      let dist = distance(poly1[i], intersectionPoints[0]);
      dist1.push(dist);
    }

    for (let i = 0; i < poly2.length; i++) {
      let dist = distance(poly2[i], intersectionPoints[0]);
      dist2.push(dist);
    }

    // Insert the intersection point into the polygon arrays at the index where the distance is the smallest

    let minDist1 = Math.min(...dist1);
    let indexToPush1 = dist1.indexOf(minDist1);
    poly1.splice(indexToPush1 + 1, 0, intersectionPoints[1]);
    poly1.splice(indexToPush1 + 1, 0, intersectionPoints[0]);

    let minDist2 = Math.min(...dist2);
    let indexToPush2 = dist2.indexOf(minDist2);
    poly2.splice(indexToPush2, 0, intersectionPoints[0]);
    poly2.splice(indexToPush2, 0, intersectionPoints[1]);

    //Generate the two sets of points for the split polygons
    //An algorithm for finding interceptions of two lines can be found in https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    console.log(intersectionPoints);
    clearPoly();
    addPoly(poly1, "blue");
    addPoly(poly2, "green");
  };

  const distance = (coor1, coor2) => {
    const x = coor2.x - coor1.x;
    const y = coor2.y - coor1.y;
    return Math.sqrt(x * x + y * y);
  };

  const findIntersection = (x1, x2, x3, x4, y1, y2, y3, y4) => {
    let t =
      ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    let u =
      ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    return [t, u];
  };

  const addPoly = (points, color = "black") => {
    if (points.length < 2) {
      console.error("Not enough points");
      return;
    }

    const content = document.getElementById("content");

    var svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    var svgPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    let path = "M" + points[0].x + " " + points[0].y;

    for (const point of points) {
      path += " L" + point.x + " " + point.y;
    }
    path += " Z";
    svgPath.setAttribute("d", path);
    svgPath.setAttribute("stroke", color);

    svgElement.setAttribute("height", "500");
    svgElement.setAttribute("width", "500");
    svgElement.setAttribute("style", "position: absolute;");
    svgElement.setAttribute("fill", "transparent");

    svgElement.appendChild(svgPath);
    content.appendChild(svgElement);
  };

  const clearPoly = () => {
    const content = document.getElementById("content");
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }
  };

  const points = [
    { x: 100, y: 100 },
    { x: 200, y: 50 },
    { x: 300, y: 50 },
    { x: 400, y: 200 },
    { x: 350, y: 250 },
    { x: 200, y: 300 },
    { x: 150, y: 300 },
  ];

  useEffect(() => {
    clearPoly();
    addPoly(points);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return;
  }, []);

  return null;
};

export default App;
