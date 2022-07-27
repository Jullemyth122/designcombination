import React, { useEffect } from 'react'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier'

function Second() {

    useEffect(() => {
        let sceneContainer = document.querySelector(".container")
        let scene = new THREE.Scene();
        let bgColor = 0x000000;
        scene.background = new THREE.Color(bgColor);
        let camera = new THREE.PerspectiveCamera(60, sceneContainer.clientWidth / sceneContainer.clientHeight, 1, 1000);
        camera.position.set(-8, 5, 3);
        let renderer = new THREE.WebGLRenderer({antialias: true,alpha:true});
        renderer.setPixelRatio(devicePixelRatio)
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
        sceneContainer.appendChild(renderer.domElement);

        let controls = new OrbitControls(camera, renderer.domElement);

        let number = 512 * 512;

        const geometry = new THREE.BoxBufferGeometry( 50, 2, 20,5,5,5 );
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            // roughness: 0, 
            // metalness: 0,
            // shininess  : 1,
            wireframe:true
        })
        



        const mesh = new THREE.Mesh(geometry,material)
        scene.add( mesh )      

        const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

        let light3 = new THREE.SpotLight( 0x80ff80 , 1 , 10000 );
        light3.castShadow = true;

        light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
        // light3.position.set(5,10,5)
        light3.position.set( - 10, 50, -15 );
        scene.add( light3 );


        const sphere2 = new THREE.SphereGeometry( 0.5, 16, 8 );

        let light2 = new THREE.SpotLight( 0xfc0303 , 1 , 10000 );
        light2.castShadow = true;

        light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xfc0303 } ) ) );
        // light2.position.set(5,10,5)
        light2.position.set( 20, -20, 15 );
        scene.add( light2 );

        function animate() {
            requestAnimationFrame(animate)

            renderer.render(scene,camera)
        }

        window.addEventListener("resize",() => {
            camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
        })

        animate()

    },[])

    return (
        <div className='container-fluid'>
            <div className="container"></div>
        </div>
    )
}

export default Second