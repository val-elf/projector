import { color2RGBA, RGB2rgba } from 'common/colors';

export const styles = theme => {
    // console.log('THM', theme);
    const mainColor = color2RGBA(theme.palette.primary.main);
    const shadowColor = Object.assign({}, mainColor, { a: 0.3 });
    return {
        root: {
            paddingLeft: '5px',
            position: 'relative',
            height: '22px',
            marginTop: '14px',
            display: 'inline-flex',
            outline: 'none',
            '&:focus': {
                color: theme.palette.primary.main,
                '& $label': {
                    color: 'inherit'
                }
            },
            '&:active $marker:before': {
                display: 'block',
                width: '30px',
                height: '30px',
            },
            touchAction: 'none'
        },
        marker: {
            bottom: '6px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            position: 'absolute',
            transition: `left 0.2s ${theme.transitions.easing.easeInOut}`,
            backgroundColor: `${theme.palette.primary.main}`,
            transform: 'translateX(-5px)',
            '&.draggable': {
                transition: 'none'
            },
            '&:hover:before': {
                display: 'block',
                width: '20px',
                height: '20px'
            },
            '&:before': {
                content: '""',
                position: 'absolute',
                marginLeft: '50%',
                marginTop: '50%',
                width: '0px',
                height: '0px',
                transform: 'translate(-50%, -50%)',
                backgroundColor: RGB2rgba(shadowColor),
                borderRadius: '50%',
                // display: 'none',
                transition: 'width 0.2s, height 0.2s'
            }
        },
        label: {
            color: `${theme.palette.text.secondary}`,
            transition: 'transform 0.2s',
            transformOrigin: 'top left',
            transform: 'scale(0.75) translate(0, -120%)',
            position: 'absolute',
            left: 0
        },
        line: {
            borderBottom: `2px solid ${RGB2rgba(shadowColor)}`,
			position: 'absolute',
			left: 0,
            bottom: '10px',
            width: '100%',
            '& .meter': {
                position: 'absolute',
                bottom: '-2px',
                backgroundColor: theme.palette.primary.main,
                height: '2px',
                display: 'inline-block'
            },
        }
    }
};
