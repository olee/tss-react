import type { ReactComponent } from "./tools/ReactComponent";
import type { CSSObject, Css, Cx } from "./types";
import { createMakeStyles } from "./createMakeStyles";

export function createWithStyles<Theme>(params: {
    useTheme(): Theme;
    useCssAndCx(): { css: Css; cx: Cx };
}) {
    const { useTheme, useCssAndCx } = params;

    const { makeStyles } = createMakeStyles({ useTheme, useCssAndCx });

    function withStyles<
        Props extends Record<string, unknown>,
        C extends ReactComponent<Props>,
    >(
        Component: C,
        cssObjectOrGetCssObject:
            | CSSObject
            | ((theme: Theme, props: Props, css: Css) => CSSObject),
    ): C {
        const useStyles = makeStyles<Props>()(
            typeof cssObjectOrGetCssObject === "function"
                ? (theme: Theme, props: Props, css: Css) => ({
                      "root": cssObjectOrGetCssObject(theme, props, css),
                  })
                : { "root": cssObjectOrGetCssObject },
        );

        const Out = function (props: Props) {
            const { classes, cx } = useStyles(props);

            const { className, ...rest } = props;

            if (className !== undefined && typeof className !== "string") {
                throw new Error();
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Component_: ReactComponent<any> = Component;

            return (
                <Component_ className={cx(classes.root, className)} {...rest} />
            );
        };

        const { name } = Component;

        if (typeof name === "string") {
            Object.defineProperty(Out, "name", {
                "value": `${name}WithStyles`,
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Out as any;
    }

    return { withStyles };
}
