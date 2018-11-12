var d, h, m, s, ampm, animate;

function init() {
    d = new Date();
    h = d.getHours();
    m = d.getMinutes();
    s = d.getSeconds();
    clock();
};

function clock() {
    s++;
    if (h > 12) {
        ampm = h - 12;
    }
    if (s == 60) {
        s = 0;
        m++;
        if (m == 60) {
            m = 0;
            ampm++;
            if (ampm > 12) {
                ampm = 0;
            }
        }
    }
    changeHTML('ampm', s);
    changeHTML('min', m);
    changeHTML('hr', ampm);
    animate = setTimeout(clock, 1000);
};

function changeHTML(id, val) {
    if (id === 'ampm') {
        if (h > 12) {
            val = 'PM';
        }
        else {
            val = 'AM';
        }

    }
    else if (id === 'min') {
        if (val < 10) {
            val = '0' + val;
        }
    }
    document.getElementById(id).innerHTML = val;
};

window.onload = init;