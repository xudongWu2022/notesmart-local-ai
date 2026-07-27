import React, { useEffect, useRef } from 'react';
import { Markmap, loadCSS, loadJS } from 'markmap-view';

const MarkmapComponent = ({ content }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      Markmap.create(svgRef.current, null, content);
    }
  }, [content]);

  useEffect(() => {
    // Load necessary assets for Markmap
    loadCSS('https://cdn.jsdelivr.net/npm/markmap-view/dist/markmap-view.css');
    loadJS('https://cdn.jsdelivr.net/npm/d3/dist/d3.min.js');
    loadJS(
      'https://cdn.jsdelivr.net/npm/markmap-view/dist/markmap-view.min.js',
    );
  }, []);

  return <svg ref={svgRef} style={{ width: '100%', height: '500px' }}></svg>;
};

export default MarkmapComponent;
