import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
  // useEffect,
} from "react";

export interface Props extends HTMLAttributes<HTMLElement> {
  scrollIntoView?: boolean;
}

const Layout: ForwardRefRenderFunction<HTMLElement, Props> = (
  { children, ...props },
  ref
) => {
  // useEffect(() => {

  //   setTimeout(() => {
  //     window.scrollTo(0, document.body.scrollHeight/2 );

  //   }, 500);

  // }, []);

  return (
    <section
      {...props}
      ref={ref}
      css={(theme) => ({
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        position: "relative",
      })}
    >
      <div
        css={(theme) => ({
          maxWidth: theme.spacing(142),
          margin: "0 auto",
        })}
      >
        {children}
      </div>
    </section>
  );
};

export default forwardRef(Layout);
