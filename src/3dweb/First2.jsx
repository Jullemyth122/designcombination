import React, { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function First2() {

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


        const geometry = new THREE.BoxGeometry( 10, 10, 10 );
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0})
        const mesh = new THREE.Mesh(geometry,material)
        mesh.scale.set(0.7,0.7,0.7)
        scene.add( mesh )
        for (let i = 1; i < 100; i++) {

            let geometry = new THREE.BoxGeometry( 10 *  i / 2, 10 * i / 2 , 10 * i / 2);
            const edges = new THREE.EdgesGeometry( geometry );
            const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xfffbbb } ) );
            scene.add( line );
            
        }        

        const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

        // let light3 = new THREE.RectAreaLight( 0x80ff80, 5, 4, 10 );
        let light3 = new THREE.SpotLight( 0x80ff80 );
        light3.castShadow = true;

        light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
        // light3.position.set(5,10,5)
        light3.position.set( - 6, 10, 10 );
        scene.add( light3 );

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

export default First2