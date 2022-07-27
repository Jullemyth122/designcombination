import React, { useEffect } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

function First() {

    useEffect(() => {

        let sceneContainer = document.querySelector(".container")
        let scene = new THREE.Scene();
        let bgColor = 0x000000;
        scene.background = new THREE.Color(bgColor);
        let camera = new THREE.PerspectiveCamera(60, sceneContainer.clientWidth / sceneContainer.clientHeight, 1, 1000);
        camera.position.set(-8, 5, 3);
        let renderer = new THREE.WebGLRenderer({antialias: false});
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
        sceneContainer.appendChild(renderer.domElement);
        
        const params = {
          exposure: 1,
          bloomStrength: 2,
          bloomThreshold: 0,
          bloomRadius: 0
        };
        
        const renderScene = new RenderPass( scene, camera );
        
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( sceneContainer.clientWidth, sceneContainer.clientHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;
        
        const bloomComposer = new EffectComposer( renderer );
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass( renderScene );
        bloomComposer.addPass( bloomPass );
        
        const finalPass = new ShaderPass(
          new THREE.ShaderMaterial( {
            uniforms: {
              baseTexture: { value: null },
              bloomTexture: { value: bloomComposer.renderTarget2.texture }
            },
            vertexShader:`
            varying vec2 vUv;

			void main() {

				vUv = uv;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}
            `,
            fragmentShader:`
            uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;

			varying vec2 vUv;

			void main() {

				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

			}
            `,
            defines: {}
          } ), "baseTexture"
        );

        finalPass.needsSwap = true;
        
        const finalComposer = new EffectComposer( renderer );
        finalComposer.addPass( renderScene );
        finalComposer.addPass( finalPass );
        
        let controls = new OrbitControls(camera, renderer.domElement);
        controls.maxDistance = 60
        let light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.setScalar(1);
        scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));
                
        const layers = 100
        let dummy = new THREE.Object3D();
        let g = NestedBoxesGeometry(5, 5 + layers, layers, 0xffd561,0xb5953c);
        let m = new THREE.LineBasicMaterial({
          vertexColors: true,
        });
        let l = new THREE.LineSegments(g, m);
        scene.add(l);
        
        let darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        let lightMaterial = new THREE.MeshLambertMaterial({color: 0xffd561});
        let box = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), lightMaterial);
        scene.add(box);

        window.addEventListener("resize", () => {
          camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
        })
        
        let count = 0;

        renderer.setAnimationLoop(() => {

            box.material = darkMaterial;
            //   line.material = darkMaterial;
            scene.background.set(0x000000); // all, except blooming objects, must be black, including background
            bloomComposer.render();
            //   line.material = lightMaterial;
            box.material = lightMaterial;
            scene.background.set(bgColor); // set background color back
            finalComposer.render();
        
        //   renderer.render(scene, camera);
        })
        
        function NestedBoxesGeometry(minSize, maxSize, layers = 3, innerColor = 0xffd561, outerColor = 0xb5953c){
          

            layers = Math.max(1, layers);
            
            let cI = new THREE.Color(innerColor);
            let cO = new THREE.Color(outerColor);
            let cM = new THREE.Color();
          
            let basePts = [
                [0, 2, 0],[2, 2, 0],[2, 2, 2],[0, 2, 2],
                [0, 0, 0],[2, 0, 0],[2, 0, 2],[0, 0, 2],
            ].map(p => {return new THREE.Vector3(p[0], p[1], p[2])
                .subScalar(1)
            });

            

            let baseIndex = [
                4, 5, 5, 6, 6, 7, 7, 4,
                0, 4, 1, 5, 2, 6, 3, 7,
                0, 1, 1, 2, 2, 3, 3, 0,
            ];

        //   let baseIndex = [
        //       0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7
        //   ];
          
        //   let connect = [
        //     0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15
        //   ];

            let connect = [
                0, 8, 1, 9, 2, 10, 3, 11,
                4, 12, 5, 13, 6, 14, 7, 15
            ];

            
            let sizeStep = (maxSize - minSize) / (layers - 1);
            let pts = [];
            let idx = [];
            let col = [];
            let layer = [];
            for(let i = 0; i < layers; i++){
                basePts.forEach(p => {
                pts.push(p.clone().multiplyScalar(i * sizeStep + minSize));
                layer.push(i);
                cM.lerpColors(cI, cO, i / (layers - 1));
                col.push(cM.r, cM.g, cM.b);
                });
                
                baseIndex.forEach(id => {
                idx.push(id + i * 8)
                })
                
                if (i < (layers - 1)){
                connect.forEach(c => {
                    idx.push(c + i * 8);
                })
                }
            }
            
            console.log(idx)
            console.log(col)
            console.log(layer)
            let g = new THREE.BufferGeometry().setFromPoints(pts);
            g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
            g.setAttribute("layer", new THREE.Float32BufferAttribute(layer, 1));
            g.setIndex(idx);
            
            return g;
        }
    },[])

    return (
        <div className='container-fluid'>
            <div className="container"></div>
        </div>
    )
}

export default First