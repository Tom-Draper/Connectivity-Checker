
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Graph.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\Graph.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", "plotDiv");
    			add_location(div0, file$1, 17, 2, 569);
    			attr_dev(div1, "id", "plotly");
    			add_location(div1, file$1, 16, 0, 548);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Graph', slots, []);
    	let { graphData } = $$props;

    	onMount(() => {
    		console.log(graphData);
    		let plotDiv = document.getElementById("plotDiv");

    		new Plotly.newPlot(plotDiv,
    		[graphData],
    		{
    				title: false,
    				height: 200,
    				margin: { r: 50, l: 0, t: 20, b: 20, pad: 5 },
    				colorway: ['#c9c9c9'],
    				yaxis: {
    					side: "right",
    					ticksuffix: "ms",
    					color: "#949494"
    				},
    				xaxis: { color: "white" }
    			},
    		{ showSendToCloud: false, staticPlot: true });
    	});

    	const writable_props = ['graphData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Graph> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('graphData' in $$props) $$invalidate(0, graphData = $$props.graphData);
    	};

    	$$self.$capture_state = () => ({ onMount, graphData });

    	$$self.$inject_state = $$props => {
    		if ('graphData' in $$props) $$invalidate(0, graphData = $$props.graphData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [graphData];
    }

    class Graph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { graphData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graph",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*graphData*/ ctx[0] === undefined && !('graphData' in props)) {
    			console_1.warn("<Graph> was created without expected prop 'graphData'");
    		}
    	}

    	get graphData() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set graphData(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (67:6) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Service down";
    			attr_dev(img, "class", "big-cross svelte-140j2ms");
    			if (!src_url_equal(img.src, img_src_value = "./img/cross.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 67, 8, 2012);
    			attr_dev(h2, "class", "status svelte-140j2ms");
    			add_location(h2, file, 68, 8, 2076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(67:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:6) {#if data.live}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "All services are online";
    			attr_dev(img, "class", "big-tick svelte-140j2ms");
    			if (!src_url_equal(img.src, img_src_value = "./img/bigtick.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 64, 8, 1878);
    			attr_dev(h2, "class", "status svelte-140j2ms");
    			add_location(h2, file, 65, 8, 1942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:6) {#if data.live}",
    		ctx
    	});

    	return block;
    }

    // (87:8) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ping empty svelte-140j2ms");
    			add_location(div, file, 87, 8, 2649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(87:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:33) 
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ping failed svelte-140j2ms");
    			add_location(div, file, 85, 8, 2597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(85:33) ",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#if ping[0] == 200}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ping ok svelte-140j2ms");
    			add_location(div, file, 83, 8, 2531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(83:8) {#if ping[0] == 200}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {#each pings as ping}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*ping*/ ctx[9][0] == 200) return create_if_block;
    		if (/*ping*/ ctx[9][0] == 404) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(82:8) {#each pings as ping}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div8;
    	let div1;
    	let t0;
    	let div0;
    	let t2;
    	let div7;
    	let h4;
    	let t4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t5;
    	let div2;
    	let t9;
    	let div4;
    	let t10;
    	let div5;
    	let t12;
    	let div6;
    	let graph;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[1].live) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*pings*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	graph = new Graph({
    			props: { graphData: /*graphData*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div8 = element("div");
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = `${/*data*/ ctx[1].time}`;
    			t2 = space();
    			div7 = element("div");
    			h4 = element("h4");
    			h4.textContent = "pldashboard.com";
    			t4 = space();
    			div3 = element("div");
    			img = element("img");
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = `Uptime: ${/*uptime*/ ctx[3]}%`;
    			t9 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div5 = element("div");
    			div5.textContent = "Last 150 hours";
    			t12 = space();
    			div6 = element("div");
    			create_component(graph.$$.fragment);
    			attr_dev(div0, "class", "last-updated svelte-140j2ms");
    			add_location(div0, file, 70, 6, 2131);
    			attr_dev(div1, "class", "header svelte-140j2ms");
    			add_location(div1, file, 62, 4, 1827);
    			attr_dev(h4, "class", "name svelte-140j2ms");
    			add_location(h4, file, 73, 6, 2226);
    			attr_dev(img, "class", "tick svelte-140j2ms");
    			if (!src_url_equal(img.src, img_src_value = "./img/tick.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 75, 8, 2299);
    			attr_dev(div2, "class", "uptime-text");
    			add_location(div2, file, 76, 8, 2356);
    			attr_dev(div3, "class", "uptime svelte-140j2ms");
    			add_location(div3, file, 74, 6, 2270);
    			attr_dev(div4, "class", "pings svelte-140j2ms");
    			add_location(div4, file, 80, 6, 2444);
    			attr_dev(div5, "class", "last-hours svelte-140j2ms");
    			add_location(div5, file, 91, 6, 2725);
    			attr_dev(div6, "class", "ping-graph svelte-140j2ms");
    			add_location(div6, file, 92, 6, 2776);
    			attr_dev(div7, "class", "pings-container svelte-140j2ms");
    			add_location(div7, file, 72, 4, 2190);
    			attr_dev(div8, "class", "content svelte-140j2ms");
    			add_location(div8, file, 55, 2, 1590);
    			attr_dev(main, "class", "svelte-140j2ms");
    			add_location(main, file, 54, 0, 1581);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div8);
    			append_dev(div8, div1);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, h4);
    			append_dev(div7, t4);
    			append_dev(div7, div3);
    			append_dev(div3, img);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div7, t9);
    			append_dev(div7, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div7, t10);
    			append_dev(div7, div5);
    			append_dev(div7, t12);
    			append_dev(div7, div6);
    			mount_component(graph, div6, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pings*/ 1) {
    				each_value = /*pings*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(graph.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(graph.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(graph);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let pings = [];

    	for (let i = 0; i < 95; i++) {
    		pings.push([
    			200,
    			Math.floor(Math.random() * 100) * Math.random() + Math.floor(Math.random() * 10)
    		]);
    	}

    	for (let i = 0; i < 5; i++) {
    		pings.push([404, -1]);
    	}

    	for (let i = 0; i < 50; i++) {
    		pings.push([
    			200,
    			Math.floor(Math.random() * 100) * Math.random() + Math.floor(Math.random() * 10)
    		]);
    	}

    	let filler = Array(150 - pings.length).fill([null, null]);
    	pings = filler.concat(pings);

    	let data = {
    		live: true,
    		time: new Date(Date.now()).toUTCString(),
    		data: pings
    	};

    	let x = [];
    	let y = [];

    	for (let i = 0; i < pings.length; i++) {
    		if (pings[i][1] == null || pings[i][1] < 0) {
    			y.push(0);
    		} else {
    			y.push(pings[i][1]);
    		}

    		x.push(i + 1);
    	}

    	let graphData = { x, y, type: "bar" };
    	let upCounts = 0;

    	for (let i = 0; i < pings.length; i++) {
    		if (pings[i][0] == 200) {
    			upCounts += 1;
    		}
    	}

    	let uptime = (upCounts / pings.length * 100).toFixed(1);
    	let darkmode = "off";

    	if (darkmode == "on") {
    		document.documentElement.style.setProperty("--background", "#23272a");
    		document.documentElement.style.setProperty("--card", "#1d2023");
    		document.documentElement.style.setProperty("--text", "white");
    	} else {
    		document.documentElement.style.setProperty("--background", "white");
    		document.documentElement.style.setProperty("--card", "white");
    		document.documentElement.style.setProperty("--text", "black");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Graph,
    		pings,
    		filler,
    		data,
    		x,
    		y,
    		graphData,
    		upCounts,
    		uptime,
    		darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ('pings' in $$props) $$invalidate(0, pings = $$props.pings);
    		if ('filler' in $$props) filler = $$props.filler;
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    		if ('graphData' in $$props) $$invalidate(2, graphData = $$props.graphData);
    		if ('upCounts' in $$props) upCounts = $$props.upCounts;
    		if ('uptime' in $$props) $$invalidate(3, uptime = $$props.uptime);
    		if ('darkmode' in $$props) darkmode = $$props.darkmode;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pings, data, graphData, uptime];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
