import React, { useEffect } from 'react'
import gsap from 'gsap'
import { Renderer,Vec2,Mesh,Vec4,Flowmap,Geometry,Texture,Program } from 'ogl'
function Canvas() {

    useEffect(() => {
        var vertex = `
                attribute vec2 uv;
                attribute vec2 position;
                varying vec2 vUv;
                void main() {
                        vUv = uv;
                        gl_Position = vec4(position, 0, 1);
                }
        `;
        var fragment = `
                precision highp float;
                precision highp int;
                uniform sampler2D tWater;
                uniform sampler2D tFlow;
                uniform float uTime;
                varying vec2 vUv;
                uniform vec4 res;
                uniform vec2 img;

                vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
                        return uvs * factor - factor /2. + 0.5;
                }

                void main() {

                    // R and G values are velocity in the x and y direction
                    // B value is the velocity length
                    vec3 flow = texture2D(tFlow, vUv).rgb;

                    vec2 uv = .5 * gl_FragCoord.xy / res.xy ;

                    // vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
                    vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
                    myUV -= flow.xy * (0.15 * 1.2);

                    vec2 myUV2 = (uv - vec2(0.5))*res.zw + vec2(0.5);
                    myUV2 -= flow.xy * (0.125 * 1.2);

                    vec2 myUV3 = (uv - vec2(0.5))*res.zw + vec2(0.5);
                    myUV3 -= flow.xy * (0.10 * 1.4);

                    vec3 tex = texture2D(tWater, myUV).rgb;
                    vec3 tex2 = texture2D(tWater, myUV2).rgb;
                    vec3 tex3 = texture2D(tWater, myUV3).rgb;

                    gl_FragColor = vec4(tex.r, tex2.g, tex3.b, 1.0);
                }
        `;
        {
            var _size = [2048, 1638];
            var renderer = new Renderer({ dpr: 2 });
            var gl = renderer.gl;
            document.body.appendChild(gl.canvas);

            // Variable inputs to control flowmap
            var aspect = 1;
            var mouse = new Vec2(-1);
            var velocity = new Vec2();
            function resize() {
                gl.canvas.width = window.innerWidth * 2.0;
                gl.canvas.height = window.innerHeight * 2.0;
                gl.canvas.style.width = window.innerWidth + "px";
                gl.canvas.style.height = window.innerHeight + "px";

                var a1, a2;
                var imageAspect = _size[1] / _size[0];
                if (window.innerHeight / window.innerWidth < imageAspect) {
                    a1 = 1;
                    a2 = window.innerHeight / window.innerWidth / imageAspect;
                } else {
                    a1 = window.innerWidth / window.innerHeight * imageAspect;
                    a2 = 1;
                }
                mesh.program.uniforms.res.value = new Vec4(
                    window.innerWidth,
                    window.innerHeight,
                    a1,
                    a2
                );

                renderer.setSize(window.innerWidth, window.innerHeight);
                aspect = window.innerWidth / window.innerHeight;
            }
            var flowmap = new Flowmap(gl, {
                falloff: 0.3,
                dissipation: 0.92,
                alpha: 0.5
            });
            // Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
            var geometry = new Geometry(gl, {
                position: {
                    size: 2,
                    data: new Float32Array([-1, -1, 3, -1, -1, 3])
                },
                uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
            });
            var texture = new Texture(gl, {
                minFilter: gl.LINEAR,
                magFilter: gl.LINEAR
            });
            var img = new Image();
            img.onload = () => (texture.image = img);
            img.crossOrigin = "Anonymous";
            img.src = "./img/pic1.jpg";

            var a1, a2;
            var imageAspect = _size[1] / _size[0];
            if (window.innerHeight / window.innerWidth < imageAspect) {
                a1 = 1;
                a2 = window.innerHeight / window.innerWidth / imageAspect;
            } else {
                a1 = window.innerWidth / window.innerHeight * imageAspect;
                a2 = 1;
            }

            var program = new Program(gl, {
                vertex,
                fragment,
                uniforms: {
                    uTime: { value: 0 },
                    tWater: { value: texture },
                    res: {
                        value: new Vec4(window.innerWidth, window.innerHeight, a1, a2)
                    },
                    img: { value: new Vec2(_size[1], _size[0]) },
                    tFlow: flowmap.uniform
                }
            });
            var mesh = new Mesh(gl, { geometry, program });

            window.addEventListener("resize", resize, false);
            resize();

            // Create handlers to get mouse position and velocity
            var isTouchCapable = "ontouchstart" in window;
            if (isTouchCapable) {
                window.addEventListener("touchstart", updateMouse, false);
                window.addEventListener("touchmove", updateMouse, { passive: false });
            } else {
                window.addEventListener("mousemove", updateMouse, false);
            }
            var lastTime;
            var lastMouse = new Vec2();
            function updateMouse(e) {
                // e.preventDefault();
            
                if (e.changedTouches && e.changedTouches.length) {
                    e.x = e.changedTouches[0].pageX;
                    e.y = e.changedTouches[0].pageY;
                }
                if (e.x === undefined) {
                    e.x = e.pageX;
                    e.y = e.pageY;
                }
                // Get mouse value in 0 to 1 range, with y flipped
                mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
                // Calculate velocity
                if (!lastTime) {
                    // First frame
                    lastTime = performance.now();
                    lastMouse.set(e.x, e.y);
                }

                var deltaX = e.x - lastMouse.x;
                var deltaY = e.y - lastMouse.y;

                lastMouse.set(e.x, e.y);

                var time = performance.now();

                // Avoid dividing by 0
                var delta = Math.max(10.4, time - lastTime);
                lastTime = time;
                velocity.x = deltaX / delta;
                velocity.y = deltaY / delta;
                velocity.needsUpdate = true;
            }
            requestAnimationFrame(update);
            function update(t) {
                requestAnimationFrame(update);
                // Reset velocity when mouse not moving
                if (!velocity.needsUpdate) {
                    mouse.set(-1);
                    velocity.set(0);
                }
                velocity.needsUpdate = false;
                // Update flowmap inputs
                flowmap.aspect = aspect;
                flowmap.mouse.copy(mouse);
                // Ease velocity input, slower when fading out
                flowmap.velocity.lerp(velocity, velocity.len ? 0.15 : 0.1);
                flowmap.update();
                program.uniforms.uTime.value = t * 0.01;
                renderer.render({ scene: mesh });
            }
        }
    },[])
  
    return (
        <div className='container-fluid'>
            <div className="mask">
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1040 205.1"  xmlSpace="preserve">
                    <g>
                    <g>
                        <path className='st0' d="M43.5594 73.0002C37.426 73.0002 31.726 72.1335 26.4594 70.4002C21.2594 68.6669 16.6927 66.2002 12.7594 63.0002C8.82604 59.7335 5.75938 55.9002 3.55938 51.5002C1.42604 47.0335 0.359375 42.0669 0.359375 36.6002C0.359375 31.2002 1.45938 26.3002 3.65938 21.9002C5.92604 17.4335 8.99271 13.6002 12.8594 10.4002C16.726 7.13353 21.2594 4.63353 26.4594 2.9002C31.726 1.1002 37.3927 0.200195 43.4594 0.200195C47.6594 0.200195 51.6927 0.666862 55.5594 1.6002C59.4927 2.46686 63.1594 3.7002 66.5594 5.3002C69.9594 6.9002 72.8927 8.73353 75.3594 10.8002L64.0594 25.9002C62.526 24.5669 60.726 23.3002 58.6594 22.1002C56.6594 20.9002 54.326 19.9335 51.6594 19.2002C49.0594 18.4669 46.026 18.1002 42.5594 18.1002C39.826 18.1002 37.1594 18.5002 34.5594 19.3002C32.026 20.1002 29.6927 21.3002 27.5594 22.9002C25.4927 24.4335 23.826 26.3669 22.5594 28.7002C21.3594 31.0335 20.7594 33.7335 20.7594 36.8002C20.7594 39.8669 21.3927 42.5669 22.6594 44.9002C23.9927 47.1669 25.7927 49.1002 28.0594 50.7002C30.3927 52.2335 32.9927 53.4002 35.8594 54.2002C38.726 54.9335 41.726 55.3002 44.8594 55.3002C48.326 55.3002 51.3927 54.8335 54.0594 53.9002C56.726 52.9669 59.0594 51.8335 61.0594 50.5002C63.0594 49.1669 64.8594 47.9335 66.4594 46.8002L75.6594 61.9002C73.726 63.5002 71.0927 65.1669 67.7594 66.9002C64.4927 68.6335 60.7594 70.1002 56.5594 71.3002C52.426 72.4335 48.0927 73.0002 43.5594 73.0002Z"/>
                        <path className='st0' d="M99.1953 72.0002V2.0002H138.095C144.029 2.0002 148.995 2.93353 152.995 4.8002C157.062 6.6002 160.162 9.2002 162.295 12.6002C164.429 15.9335 165.495 19.9669 165.495 24.7002C165.495 29.3002 164.329 33.4002 161.995 37.0002C159.662 40.6002 156.495 43.4335 152.495 45.5002C148.495 47.5669 143.929 48.6002 138.795 48.6002H117.795V72.0002H99.1953ZM146.795 72.0002L124.195 40.4002L144.795 37.9002L169.395 72.0002H146.795ZM117.795 34.4002H136.395C138.129 34.4002 139.695 34.0669 141.095 33.4002C142.495 32.7335 143.629 31.7669 144.495 30.5002C145.362 29.2335 145.795 27.7002 145.795 25.9002C145.795 24.1669 145.329 22.7002 144.395 21.5002C143.529 20.3002 142.362 19.4002 140.895 18.8002C139.429 18.2002 137.762 17.9002 135.895 17.9002H117.795V34.4002Z"/>
                        <path className='st0' d="M194.996 72.0002V2.0002H257.096V18.3002H213.996V55.7002H258.596V72.0002H194.996ZM205.196 44.2002V28.8002H253.096V44.2002H205.196Z"/>
                        <path className='st0' d="M274.821 72.0002L308.321 2.0002H325.621L359.021 72.0002H339.021L321.021 34.7002C320.221 33.0335 319.521 31.5335 318.921 30.2002C318.321 28.8002 317.788 27.4669 317.321 26.2002C316.854 24.9335 316.388 23.6669 315.921 22.4002C315.521 21.1335 315.154 19.8335 314.821 18.5002L318.721 18.4002C318.321 19.8669 317.888 21.2669 317.421 22.6002C317.021 23.9335 316.521 25.2335 315.921 26.5002C315.388 27.7669 314.821 29.0669 314.221 30.4002C313.621 31.7335 312.988 33.1669 312.321 34.7002L294.421 72.0002H274.821ZM290.721 61.2002L296.821 47.2002H337.021L340.221 61.2002H290.721Z"/>
                        <path className='st0' d="M393.319 72.0002V19.1002H366.519V2.0002H440.619V19.1002H413.119V72.0002H393.319Z"/>
                        <path className='st0' d="M465.741 72.0002V55.2002H483.541V18.8002H465.741V2.0002H521.041V18.8002H503.341V55.2002H521.041V72.0002H465.741Z"/>
                        <path className='st0' d="M574.404 72.0002L543.004 2.0002H563.004L576.704 34.0002C577.171 35.1335 577.771 36.5002 578.504 38.1002C579.237 39.7002 580.004 41.4669 580.804 43.4002C581.604 45.3335 582.404 47.4002 583.204 49.6002C584.004 51.8002 584.704 54.0669 585.304 56.4002H581.504C582.371 53.5335 583.304 50.8002 584.304 48.2002C585.304 45.6002 586.304 43.1669 587.304 40.9002C588.304 38.5669 589.237 36.3002 590.104 34.1002L603.404 2.0002H623.004L592.304 72.0002H574.404Z"/>
                        <path className='st0' d="M644.941 72.0002V55.2002H662.741V18.8002H644.941V2.0002H700.241V18.8002H682.541V55.2002H700.241V72.0002H644.941Z"/>
                        <path className='st0' d="M752.303 72.0002V19.1002H725.503V2.0002H799.603V19.1002H772.103V72.0002H752.303Z"/>
                        <path className='st0' d="M847.002 72.0002V40.0002L848.702 47.1002L813.002 2.0002H836.802L863.002 36.4002H851.402L876.602 2.0002H899.002L866.302 45.2002L867.002 39.2002V72.0002H847.002Z"/>
                    </g>
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default Canvas