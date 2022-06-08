import { FC, HTMLAttributes, useRef } from "react";
import { useState, useEffect} from "react";
import { theme } from "../../pages/_app";
import interact from 'interactjs'

interface Props extends HTMLAttributes<HTMLElement> {
  animated?: boolean;
  isStatic?: boolean;
  size?: "big";
  interactive?: boolean;
  noInfo?: boolean;
  isPlaceholder?: boolean;
}

const Card: FC<Props> = ({
  isStatic,
  size,
  isPlaceholder = false,
  interactive,
  ...props
}) => {
  const [hovered] = useState(false);
  const width = size === "big" ? 37 : 21;
  const height = size === "big" ? 52 : 29.4;
  const wrapper = useRef<HTMLDivElement>(null);


useEffect(() => {
  interact('.dropzone').dropzone({
    // only accept elements matching this CSS selector
    accept: '.draggable',
    // Require a 75% element overlap for a drop to be possible
    overlap: 0.75,
  
    // listen for drop related events:
  
    ondropactivate: function (event) {
      console.log('active')
      // add active dropzone feedback
      event.target.classList.add('drop-active')
    },
    ondragenter: function (event) {
      const draggableElement = event.relatedTarget
      const dropzoneElement = event.target
  
      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target')
      draggableElement.classList.add('can-drop')
      draggableElement.textContent = 'Dragged in'
    },
    ondragleave: function (event) {
      // remove the drop feedback style
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')
      event.relatedTarget.textContent = 'Dragged out'
    },
    ondrop: function (event) {
      event.relatedTarget.textContent = 'Dropped'
    },
    ondropdeactivate: function (event) {
      // remove active dropzone feedback
      event.target.classList.remove('drop-active')
      event.target.classList.remove('drop-target')
    }
  })
  
}, [])


  

  return (
    <div
      {...props}
      css={(theme) => ({
        "&:hover": {
          color: "rgba(10, 10, 10, 0.7)",
        },
        transition: theme.transitions.fast("color"),
        width: theme.spacing(width),
        textAlign: "center",
        color: theme.colors.text_subtitle_dark,
        fontWeight: 500,
        fontsize: 18,
        lineheight: 21,
        className: 'dropzone'
      })}
    >
      <div ref={wrapper}>
        <div
          css={(theme) => [
            {
              overflow: "hidden",
              position: "relative",
              height: theme.spacing(height),
              borderRadius: theme.spacing(1.5),
              border: isPlaceholder ? "0" : "3px dashed #111",
              background: isPlaceholder ? "#111" : "transparent",
              transition: 'all 400ms',
              "&:hover": {
              border: isPlaceholder ? "0" : "3px dashed #222",
                ".plus-icon": {
                  color: '#7B61FF'
                }
              }
            },
            hovered &&
              !interactive &&
              !isStatic && {
                transform: `translate(0, -${theme.spacing(0)}px)`,
                boxShadow: "0 20px 10px rgba(0, 0, 0, 0.25)",
              },
          ]}
        >
          <div
            style={{
              position: "absolute",
              opacity: 1,
              transition: theme.transitions.slow("opacity"),
              zIndex: hovered ? -1 : 1,
              display: "flex",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              alignItems: "center",
            }}
          >
            {!isPlaceholder && (
              <div
              className='plus-icon'
                css={{
                  width: "70px",
                  height: "70px",
                  background: "#181818",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100px",
                  cursor: "pointer",
                  opacity: 0.6,
                  transition: "all 400ms",
                  color: "#8B8C8F",
                  "&:hover": {
                    color: "#7B61FF",
                    opacity: 1,
                  },
                }}
              >
                <svg
                  width="31"
                  height="31"
                  viewBox="0 0 31 31"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="16"
                    y1="1.5"
                    x2="16"
                    y2="29.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="29.5"
                    y1="16"
                    x2="1.5"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
