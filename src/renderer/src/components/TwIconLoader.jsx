import React, { useState, useEffect } from "react";

/**
 * TwIconLoader component loads an SVG icon based on the provided name.
 * It uses dynamic import to load the SVG file and renders it as a React component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the SVG icon.
 * @returns {JSX.Element} - The SVG icon component.
 */
function TwIconLoader({ name, ...props }) {
    // State to hold the loaded SVG component
    const [SvgComponent, setSvgComponent] = useState(null);

    /**
     * Load the SVG file when the component mounts.
     * It uses dynamic import to load the SVG file and sets the loaded SVG component in the state.
     */
    useEffect(() => {
        import(`@assets/svg/${name}.svg?react`)
          .then((module) => {
              // Set the loaded SVG component
              setSvgComponent(() => module.default);
          })
          .catch((error) => {
              // Log any errors that occur during loading
              console.error("Error loading the SVG:", error);
          });
    }, [name]);

    /**
     * Render the SVG component if it has been loaded.
     * If the SVG component is not loaded, it renders a "NULL" div.
     */
    if (!SvgComponent) {
        return <div>NULL</div>;
    }

    // Render the SVG component with the provided props
    return <SvgComponent {...props} />;
}

export default TwIconLoader;