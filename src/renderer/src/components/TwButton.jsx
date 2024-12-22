import "./css/TwButton.scss";

import React from "react";

/**
 * Button Component
 * @param {String} background "transparent", "fill", "hover-fill" as the background.
 * @param {Boolean} transition Switch transitions
 */
const TwButton = React.forwardRef(({
                                       background = "transparent",
                                       transition = true,
                                       children,
                                       ...props
                                   }, ref) => {
    return (
      <button data-background={background} data-transition={transition} ref={ref} {...props}>
          {children}
      </button>
    );
});

export default TwButton;