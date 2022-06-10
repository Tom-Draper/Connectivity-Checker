
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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
    const file$2 = "src\\components\\Graph.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", "plotDiv");
    			add_location(div0, file$2, 16, 2, 499);
    			attr_dev(div1, "id", "plotly");
    			add_location(div1, file$2, 15, 0, 478);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[2](div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Graph', slots, []);
    	let { graphData } = $$props;
    	let plotDiv;

    	onMount(() => {
    		new Plotly.newPlot(plotDiv,
    		[graphData],
    		{
    				title: false,
    				height: 200,
    				margin: { r: 60, l: 0, t: 20, b: 20, pad: 5 },
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Graph> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			plotDiv = $$value;
    			$$invalidate(0, plotDiv);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('graphData' in $$props) $$invalidate(1, graphData = $$props.graphData);
    	};

    	$$self.$capture_state = () => ({ onMount, graphData, plotDiv });

    	$$self.$inject_state = $$props => {
    		if ('graphData' in $$props) $$invalidate(1, graphData = $$props.graphData);
    		if ('plotDiv' in $$props) $$invalidate(0, plotDiv = $$props.plotDiv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [plotDiv, graphData, div0_binding];
    }

    class Graph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { graphData: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graph",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*graphData*/ ctx[1] === undefined && !('graphData' in props)) {
    			console.warn("<Graph> was created without expected prop 'graphData'");
    		}
    	}

    	get graphData() {
    		throw new Error("<Graph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set graphData(value) {
    		throw new Error("<Graph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\components\\Card.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (29:2) {#if data != undefined}
    function create_if_block$1(ctx) {
    	let div5;
    	let h4;
    	let t0_value = /*data*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div0;
    	let t3;
    	let t4_value = /*data*/ ctx[0].uptime + "";
    	let t4;
    	let t5;
    	let t6;
    	let div2;
    	let t7;
    	let div3;
    	let t9;
    	let div4;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].live) return create_if_block_4;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let each_value = /*data*/ ctx[0].pings;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block1 = /*graphData*/ ctx[1] != undefined && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			if_block0.c();
    			t2 = space();
    			div0 = element("div");
    			t3 = text("Uptime: ");
    			t4 = text(t4_value);
    			t5 = text("%");
    			t6 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div3 = element("div");
    			div3.textContent = "Last 150 hours";
    			t9 = space();
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(h4, "class", "name svelte-8wadmv");
    			add_location(h4, file$1, 30, 6, 750);
    			attr_dev(div0, "class", "uptime-text");
    			add_location(div0, file$1, 37, 8, 1009);
    			attr_dev(div1, "class", "uptime svelte-8wadmv");
    			add_location(div1, file$1, 31, 6, 791);
    			attr_dev(div2, "class", "pings svelte-8wadmv");
    			add_location(div2, file$1, 41, 6, 1106);
    			attr_dev(div3, "class", "last-hours svelte-8wadmv");
    			add_location(div3, file$1, 52, 6, 1430);
    			attr_dev(div4, "class", "ping-graph svelte-8wadmv");
    			add_location(div4, file$1, 53, 6, 1482);
    			attr_dev(div5, "class", "pings-container svelte-8wadmv");
    			add_location(div5, file$1, 29, 4, 713);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h4);
    			append_dev(h4, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div5, t7);
    			append_dev(div5, div3);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			if (if_block1) if_block1.m(div4, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*data*/ 1) && t0_value !== (t0_value = /*data*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			}

    			if ((!current || dirty & /*data*/ 1) && t4_value !== (t4_value = /*data*/ ctx[0].uptime + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0].pings;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*graphData*/ ctx[1] != undefined) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*graphData*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:2) {#if data != undefined}",
    		ctx
    	});

    	return block;
    }

    // (35:8) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "tick svelte-8wadmv");
    			if (!src_url_equal(img.src, img_src_value = "./img/smallcross.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 35, 10, 930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(35:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#if data.live}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "tick svelte-8wadmv");
    			if (!src_url_equal(img.src, img_src_value = "./img/smalltick.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 33, 10, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(33:8) {#if data.live}",
    		ctx
    	});

    	return block;
    }

    // (48:10) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ping empty svelte-8wadmv");
    			add_location(div, file$1, 48, 12, 1348);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(48:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:39) 
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ping failed svelte-8wadmv");
    			add_location(div, file$1, 46, 12, 1288);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(46:39) ",
    		ctx
    	});

    	return block;
    }

    // (44:10) {#if ping.response > 0}
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ping ok svelte-8wadmv");
    			add_location(div, file$1, 44, 12, 1210);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(44:10) {#if ping.response > 0}",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#each data.pings as ping}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*ping*/ ctx[2].response > 0) return create_if_block_2;
    		if (/*ping*/ ctx[2].response == 0) return create_if_block_3;
    		return create_else_block$1;
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
    		source: "(43:8) {#each data.pings as ping}",
    		ctx
    	});

    	return block;
    }

    // (55:8) {#if graphData != undefined}
    function create_if_block_1$1(ctx) {
    	let graph;
    	let current;

    	graph = new Graph({
    			props: { graphData: /*graphData*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(graph.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(graph, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const graph_changes = {};
    			if (dirty & /*graphData*/ 2) graph_changes.graphData = /*graphData*/ ctx[1];
    			graph.$set(graph_changes);
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
    			destroy_component(graph, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(55:8) {#if graphData != undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let current;
    	let if_block = /*data*/ ctx[0] != undefined && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(main, file$1, 27, 0, 674);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0] != undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
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

    function createGraphData(pings) {
    	let x = new Array(pings.length).fill(1).map((_, i) => i + 1);
    	let y = [];

    	for (let i = 0; i < pings.length; i++) {
    		if (pings[i].loss == null || pings[i].response <= 0) {
    			y.push(0);
    		} else {
    			y.push(pings[i].response / 1000000);
    		}
    	}

    	let graphData = { x, y, type: "bar" };
    	return graphData;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { data } = $$props;
    	let graphData;

    	onMount(async function () {
    		$$invalidate(1, graphData = createGraphData(data.pings));
    	});

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Graph,
    		data,
    		graphData,
    		createGraphData
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('graphData' in $$props) $$invalidate(1, graphData = $$props.graphData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, graphData];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Card> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    // (82:4) {#if data != undefined}
    function create_if_block(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1_value = /*data*/ ctx[0].time + "";
    	let t1;
    	let t2;
    	let div2;
    	let card0;
    	let t3;
    	let div3;
    	let card1;
    	let t4;
    	let div4;
    	let card2;
    	let t5;
    	let div5;
    	let card3;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (!/*allServicesOnline*/ ctx[1]()) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	card0 = new Card({
    			props: { data: /*data*/ ctx[0].data[0] },
    			$$inline: true
    		});

    	card1 = new Card({
    			props: { data: /*data*/ ctx[0].data[1] },
    			$$inline: true
    		});

    	card2 = new Card({
    			props: { data: /*data*/ ctx[0].data[2] },
    			$$inline: true
    		});

    	card3 = new Card({
    			props: { data: /*data*/ ctx[0].data[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			create_component(card0.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			create_component(card1.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			create_component(card2.$$.fragment);
    			t5 = space();
    			div5 = element("div");
    			create_component(card3.$$.fragment);
    			attr_dev(div0, "class", "last-updated svelte-1ha45ww");
    			add_location(div0, file, 90, 8, 2933);
    			attr_dev(div1, "class", "header svelte-1ha45ww");
    			add_location(div1, file, 82, 6, 2587);
    			attr_dev(div2, "class", "card svelte-1ha45ww");
    			add_location(div2, file, 92, 6, 2998);
    			attr_dev(div3, "class", "card svelte-1ha45ww");
    			add_location(div3, file, 95, 6, 3076);
    			attr_dev(div4, "class", "card svelte-1ha45ww");
    			add_location(div4, file, 98, 6, 3154);
    			attr_dev(div5, "class", "card svelte-1ha45ww");
    			add_location(div5, file, 101, 6, 3232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(card0, div2, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(card1, div3, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(card2, div4, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div5, anchor);
    			mount_component(card3, div5, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*data*/ 1) && t1_value !== (t1_value = /*data*/ ctx[0].time + "")) set_data_dev(t1, t1_value);
    			const card0_changes = {};
    			if (dirty & /*data*/ 1) card0_changes.data = /*data*/ ctx[0].data[0];
    			card0.$set(card0_changes);
    			const card1_changes = {};
    			if (dirty & /*data*/ 1) card1_changes.data = /*data*/ ctx[0].data[1];
    			card1.$set(card1_changes);
    			const card2_changes = {};
    			if (dirty & /*data*/ 1) card2_changes.data = /*data*/ ctx[0].data[2];
    			card2.$set(card2_changes);
    			const card3_changes = {};
    			if (dirty & /*data*/ 1) card3_changes.data = /*data*/ ctx[0].data[3];
    			card3.$set(card3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card0.$$.fragment, local);
    			transition_in(card1.$$.fragment, local);
    			transition_in(card2.$$.fragment, local);
    			transition_in(card3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			transition_out(card2.$$.fragment, local);
    			transition_out(card3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			destroy_component(card0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			destroy_component(card1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			destroy_component(card2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div5);
    			destroy_component(card3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:4) {#if data != undefined}",
    		ctx
    	});

    	return block;
    }

    // (87:8) {:else}
    function create_else_block(ctx) {
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
    			attr_dev(img, "class", "big-tick svelte-1ha45ww");
    			if (!src_url_equal(img.src, img_src_value = "./img/bigtick.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 87, 10, 2794);
    			attr_dev(h2, "class", "status svelte-1ha45ww");
    			add_location(h2, file, 88, 10, 2861);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(87:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if !allServicesOnline()}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Services are down";
    			attr_dev(img, "class", "big-cross svelte-1ha45ww");
    			if (!src_url_equal(img.src, img_src_value = "./img/bigcross.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 84, 10, 2655);
    			attr_dev(h2, "class", "status svelte-1ha45ww");
    			add_location(h2, file, 85, 10, 2724);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(84:8) {#if !allServicesOnline()}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let current;
    	let if_block = /*data*/ ctx[0] != undefined && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "content svelte-1ha45ww");
    			add_location(div, file, 80, 2, 2529);
    			attr_dev(main, "class", "svelte-1ha45ww");
    			add_location(main, file, 79, 0, 2519);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0] != undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
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

    function calcUptime(pings) {
    	let upCounts = 0;

    	for (let i = 0; i < pings.length; i++) {
    		if (pings[i].response > 0) {
    			upCounts += 1;
    		}
    	}

    	let uptime = (upCounts / pings.length * 100).toFixed(1);
    	return uptime;
    }

    function changeFavicon() {
    	var link = document.querySelector("link[rel~='icon']");

    	if (!link) {
    		link = document.createElement("link");
    		link.rel = "icon";
    		document.getElementsByTagName("head")[0].appendChild(link);
    	}

    	link.href = "/img/faviconcross.png";
    }

    async function fetchData(address) {
    	const response = await fetch(address);
    	let json = await response.json();

    	// Insert computed values for each website
    	return json;
    }

    function formatData(json) {
    	for (let i = 0; i < json.data.length; i++) {
    		let pings = json.data[i].pings;
    		json.data[i].uptime = calcUptime(pings);
    		json.data[i].live = pings[pings.length - 1].response > 0;
    		let filler = Array(150 - pings.length).fill({ loss: null, response: null, time: null });
    		json.data[i].pings = filler.concat(pings); // Pad with null values to 150 vals
    	}

    	json.time = new Date(json.time);
    	return json;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	function allServicesOnline() {
    		if (data == undefined) {
    			return false;
    		}

    		for (let i = 0; i < data.data.length; i++) {
    			if (data.data[i].pings[data.data[i].pings.length - 1].response <= 0) {
    				return false;
    			}
    		}

    		return true;
    	}

    	let data = undefined;

    	onMount(async function () {
    		fetchData("https://connectivity-checker.herokuapp.com/data").then(json => {
    			$$invalidate(0, data = formatData(json));
    		}).then(() => {
    			if (allServicesOnline()) {
    				changeFavicon(); // console.log(data);
    			}
    		});
    	});

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
    		onMount,
    		Card,
    		allServicesOnline,
    		calcUptime,
    		changeFavicon,
    		fetchData,
    		formatData,
    		data,
    		darkmode
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('darkmode' in $$props) darkmode = $$props.darkmode;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, allServicesOnline];
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
