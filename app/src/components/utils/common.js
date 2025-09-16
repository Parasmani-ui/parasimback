import { v4 as uuidv4 } from 'uuid';

export const uuid = () => {
    return uuidv4() + '-' + Math.round(Math.random() * 10000);
};

export const name2Folder = (name) => {
    return name.trim().toLowerCase().replace(/[\W_]+/g, '_');
};

export const closestParent = (el, sel) => {
    while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el, sel)));
    return el;
};

export const mergeObjects = (...args) => {
    const output = {};
    const toDelete = [];
    args.forEach((obj) => {
        if (!obj) {
            return;
        }

        if (typeof obj === 'string' && obj.charAt(0) == '^') {
            toDelete.push(obj.substring(1));
            return;
        }

        if (Array.isArray(obj)) {
            console.error('Error: mergeObjects does not accept arrays. Arguments: (' + args + '). Object: (' + obj + '). Type: (' + typeof obj + ').')
            return;
        }

        if (typeof obj !== 'object') {
            console.error('Error: wrong object type supplied to mergeObjects. Arguments: (' + args + '). Object: (' + obj + '). Type: (' + typeof obj + ').')
            return;
        }

        for (var prop in obj) {
            output[prop] = obj[prop];
        }
    });

    toDelete.forEach((name) => {
        delete output[name];
    });

    return output;
};

export const compareObjects = (obj1, obj2) => {
    if (!obj1 && !obj2) {
        return true;
    }

    if ((!obj1 && obj2) || (obj1 && !obj2)) {
        return false;
    }

    if (typeof obj1 != typeof obj2) {
        return false;
    }

    if (obj1 == obj2) {
        return true;
    }

    const type = typeof obj1 == 'object' ? 'object' : 'other';
    if (type == 'other') {
        return obj1 == obj2;
    }

    if (Object.keys(obj1).length != Object.keys(obj2).length) {
        return false;
    }

    for (var prop in obj1) {
        const result = compareObjects(obj1[prop], obj2[prop]);
        if (!result) {
            return false;
        }
    }

    return true;
};

export const mergeClasses = (...args) => {
    var output = [];
    args.forEach((obj) => {
        if (!obj || obj == null) {
            return;
        }

        if (typeof obj === 'string' && obj.charAt(0) == '^') {
            removeFromArray(output, obj.substring(1));
            return;
        }

        if (Array.isArray(obj)) {
            output = output.concat(obj);
            return;
        }

        if (typeof obj === 'string') {
            const classes = obj.split('/ +/');
            output = output.concat(obj);
            return;
        }

        console.error('Error: wrong argument supplied to mergeClasses. Arguments: (' + args + '). Object: (' + obj + '). Type: (' + typeof obj + ').');
    });

    return output.join(' ');
};

export const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
};

export const randomColor = () => {
    // Generate random values for red, green, and blue (RGB) components
    const r = Math.floor(Math.random() * 128 + 128);
    const g = Math.floor(Math.random() * 128 + 128);
    const b = Math.floor(Math.random() * 128 + 128);

    // Construct the color string in the format #RRGGBB
    const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;

    return color;
};

export const oppositeColor = (hashColor) => {
    if (!hashColor) {
        return randomColor();
    }
    // Parse the color string into its RGB components
    let r = 256 - parseInt(hashColor.substr(1, 2), 16);
    let g = 256 - parseInt(hashColor.substr(3, 2), 16);
    let b = 256 - parseInt(hashColor.substr(5, 2), 16);

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let h, s, l = (max + min) / 2;
    let hue;

    switch (max) {
        case r:
            hue = (g - b) / (max - min) + (g < b ? 6 : 0);
            break;
        case g:
            hue = (b - r) / (max - min) + 2;
            break;
        case b:
            hue = (r - g) / (max - min) + 4;
            break;
        default:
            hue = 0;
    }

    if (max === min) {
        h = s = 0;
    } else {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
        h = hue / 60;
    }

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const similarColor = (hashColor) => {
    if (!hashColor) {
        return randomColor();
    }
    // Parse the color string into its RGB components
    const r = parseInt(hashColor.substr(1, 2), 16);
    const g = parseInt(hashColor.substr(3, 2), 16);
    const b = parseInt(hashColor.substr(5, 2), 16);

    // Calculate the average value of the RGB components
    const avg = (r + g + b) / 3;

    // Calculate the difference between the average value and each RGB component
    const diffR = avg - r;
    const diffG = avg - g;
    const diffB = avg - b;

    // Add the difference to each RGB component to get a similar color
    const similarR = Math.round(r + diffR);
    const similarG = Math.round(g + diffG);
    const similarB = Math.round(b + diffB);

    // Construct the color string in the format #RRGGBB
    const similarColor = `#${similarR.toString(16)}${similarG.toString(16)}${similarB.toString(16)}`;

    return similarColor;
};

export const toCamelCase = (str) => {
    if (!str) {
        return '';
    }
    const words = str.split(/[\_\s]+/);
    const camelCaseWords = words.map((word, index) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return camelCaseWords.join(' ');
};
