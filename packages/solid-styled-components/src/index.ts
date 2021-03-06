import { css, CSSAttribute } from "goober";
import { assignProps, splitProps, createContext, useContext } from "solid-js";
import { spread, createComponent } from "solid-js/dom";

export { css, glob, extractCss } from "goober";

const ThemeContext = createContext();

export function ThemeProvider<T extends { theme: any; children?: any }>(props: T) {
  return createComponent(ThemeContext.Provider, {
    value: props.theme,
    get children() {
      return props.children;
    }
  });
}

export function useTheme() {
  return useContext(ThemeContext);
}

type StyledTemplateArgs<T> = [
  CSSAttribute | TemplateStringsArray | string | ((props: T) => CSSAttribute | string),
  ...Array<string | number | ((props: T) => CSSAttribute | string | number | undefined)>
];

export function styled<T extends keyof JSX.IntrinsicElements>(tag: T | ((props: any) => any)) {
  return <P>(...args: StyledTemplateArgs<P & { theme?: any; as?: keyof JSX.IntrinsicElements; className?: any }>) => {
    return (
      props: P & JSX.IntrinsicElements[T] & { theme?: any; as?: keyof JSX.IntrinsicElements; className?: any }
    ): JSX.Element => {
      const clone = assignProps({}, props, {
        theme: useContext(ThemeContext),
        get className(): string {
          const pClassName = props.className,
            append = "className" in props && /^go[0-9]+/.test(pClassName!);

          // Call `css` with the append flag and pass the props
          let className = css.apply(
            { target: (this as any).target, o: append, p: newProps },
            args as [any, ...any[]]
          );

          return [pClassName, className].filter(Boolean).join(" ");
        }
      });
      const [local, newProps] = splitProps(clone, ["as"]);
      const createTag = local.as || tag;

      let el;
      if (typeof createTag === "function") {
        el = createTag(newProps);
      } else {
        el = document.createElement(createTag as any);
        spread(el, newProps);
      }

      return el;
    };
  };
}
