class DraggableList {
    constructor(entity) {
        this.element = entity;
        this.items = {};
        this.old = {};

        if (typeof entity === 'string')
            this.element = document.getElementById(entity);

        this.cursor = { x: 0, y: 0 };

        this.cloneContainer = document.createElement('div');
        this.cloneContainer.classList.add('draggingClone');

        this.element.appendChild(this.cloneContainer);

        this.element.ondragover = (e) => {
            this._handleDrag(e);
        };
    }

    push(di) {
        let key = this._generateUid();
        di.setAttribute('key', key);

        di.classList.add('draggable');
        di.draggable = true;

        di.ondragstart = (e) => {
            let clone = di.cloneNode(true);

            this.cloneContainer.appendChild(clone);

            di.classList.add('dragging');

            this.cursor.x = e.clientX;
            this.cursor.y = e.clienty;
        };

        di.ondragend = () => {
            this.cloneContainer.innerHTML = '';
            this.cloneContainer.classList.add('invis');

            di.classList.remove('dragging');
        };

        this.items[key] = di;
        this.element.appendChild(di);
    }

    _handleDrag(e) {
        e.preventDefault();

        const dragging = this.element.querySelector('.draggable.dragging');
        const notDragged = [
            ...this.element.querySelectorAll('.draggable:not(.dragging)'),
        ];

        let dX = e.clientX - this.cursor.x;

        this.cloneContainer.style.transform = `translate(${this._smoothClamp(
            dX,
            dragging.clientWidth / 10,
        )}px, ${e.pageY - dragging.clientHeight}px)`;

        this.cloneContainer.classList.remove('invis');

        let next = notDragged.find(
            (n) =>
                e.pageY + this.element.scrollTop <=
                n.offsetTop + n.offsetHeight / 2,
        );

        if (
            dragging &&
            next &&
            dragging.getAttribute('key') === next.getAttribute('key')
        )
            return;

        if (next !== dragging.nextSibling) {
            let _old = this.old;

            for (let nd of notDragged) {
                requestAnimationFrame(() => {
                    nd.style.transform = `translateY(${-(
                        nd.getBoundingClientRect().top -
                        _old[nd.getAttribute('key')]
                    )}px)`;
                    nd.style.transition = 'transform 0s';
                    requestAnimationFrame(() => {
                        nd.style.transform = '';
                        nd.style.transition = 'transform 200ms';
                    });
                });
            }
        }

        for (let nd of notDragged)
            this.old[nd.getAttribute('key')] = nd.getBoundingClientRect().top;

        if (next) this.element.insertBefore(dragging, next);
        else this.element.appendChild(dragging);
    }

    _generateUid() {
        return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            },
        );
    }

    _smoothClamp(pullDistance, maxX) {
        return (
            Math.sign(pullDistance) *
            (maxX * Math.log(1 + (Math.abs(pullDistance) / maxX) * 2))
        );
    }
}

window.onload = () => {
    const container = document.getElementById('container');
    const dl = new DraggableList(container);

    for (let i = 0; i < 10; i++) {
        let el = document.createElement('div');
        el.className = 'draggable';
        el.innerText = i;
        el.id = i;
        el.draggable = true;

        dl.push(el);
    }
};
