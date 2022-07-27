import React, { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import * as THREE from 'three'
function Profile1() {
  
    useEffect(() => {

        gsap.registerPlugin(ScrollTrigger,ScrollToPlugin)
        
        const allSt = document.querySelectorAll("[class*='st']")
        const titleSt = document.querySelectorAll("[class*='title']")
        const globeSt = document.querySelectorAll("[class*='globe']")
        gsap.to('.st-left',{
            clipPath:"polygon(0 0%, 50% 0%, 50% 100%, 0% 100%)",
            duration:2,
            ease:"power2.inOut"
        })            
        gsap.to('.st-right',{
            clipPath: "polygon(100% 0%, 50% 0%, 50% 100%, 100% 100%)",
            duration:2,
            ease:"power2.inOut"
        })            

        globeSt.forEach((elem,i) => {

            let sceneItem = elem.querySelector(".scene");
            console.log(sceneItem)
            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(75, sceneItem.clientWidth/sceneItem.clientHeight, 0.1, 1000);
            let renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});

            renderer.setSize(sceneItem.clientWidth,sceneItem.clientHeight);
            sceneItem.appendChild(renderer.domElement);

            let spotLight = new THREE.SpotLight(0xffffff);
            spotLight.position.set(100,100,100);
            spotLight.castShadow = true; //If set to true light will cast dynamic shadows. Warning: This is expensive and requires tweaking to get shadows looking right.
            spotLight.shadow = 1024;
            spotLight.receiveShadow = true
            scene.add(spotLight);

            /* Create Material */
            let material = new THREE.MeshPhongMaterial({
                color      : new THREE.Color("rgb(35,35,213)"),  //Diffuse color of the material
                emissive   : new THREE.Color("rgb(64,128,255)"), //Emissive(light) color of the material, essentially a solid color unaffected by other lighting. Default is black.
                specular   : new THREE.Color("rgb(93,195,255)"), /*Specular color of the material, i.e., how shiny the material is and the color of its shine. 
                //                                                 Setting this the same color as the diffuse value (times some intensity) makes the material more metallic-looking; 
                //                                                 setting this to some gray makes the material look more plastic. Default is dark gray.*/
                shininess  : 1,                                  //How shiny the specular highlight is; a higher value gives a sharper highlight. Default is 30.
                shading    : THREE.FlatShading,                  //How the triangles of a curved surface are rendered: THREE.SmoothShading, THREE.FlatShading, THREE.NoShading
                wireframe  : i == 0 ? true : false,                                  //THREE.Math.randInt(0,1)
                transparent: 1,
                opacity    : 1,                                //THREE.Math.randFloat(0,1) 
                
            });
            
            const geometry = new THREE.SphereGeometry( 20, 15, 15 );
            // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
            const sphere = new THREE.Mesh( geometry, material );
            scene.add( sphere );

            camera.position.z = 40;

            window.addEventListener("resize",() => {
                renderer.setSize(sceneItem.clientWidth,sceneItem.clientHeight)
                camera.aspect = sceneItem.clientWidth/sceneItem.clientHeight
                camera.updateProjectionMatrix()
            })

            function render(){
                requestAnimationFrame(render);
                // earth.rotation.x += 0.001;
                sphere.rotation.x += 0.001;
                // earth.rotation.y += 0.001;
                sphere.rotation.y += 0.001;
                renderer.render(scene, camera);
            }
            render();


        })

        titleSt.forEach((elem,i) => {
            const texts = gsap.utils.toArray(elem.querySelector("h1"))
            
            function GsapTextFunctions(array) {
                array.forEach((elem,i) => {
                    elem.innerHTML = elem.textContent.replace(/\S/g, 
                    `
                    <span class="l-hide">
                        $&   
                    </span> 
                    `);
                })
            }
    
            GsapTextFunctions(texts)

            function firstTextFunctions(array) {
                const firstGsap = gsap.utils.toArray(array)
            
                firstGsap.forEach((elem,i) => {
                    gsap.to(elem,{
                        y:0,
                        delay:1,
                        rotate:"0deg",
                        duration:(firstGsap.length/(firstGsap.length - i * (0.05 * firstGsap.length))),
                        ease:"power2.inOut"
                    })
                })
            }

            firstTextFunctions(elem.querySelector("h1").children)
        })

        allSt.forEach((elem,i) => {

            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            
            let odd = true

            function randomTween() {
              let rands = Math.ceil(Math.random() * (9 - 0) + 0);
              gsap.to(elem.querySelectorAll(".box"), {
                delay: 1,
                duration: 2,
                scale: () => odd ? 0.1 : 1,
                ease: "power2.inOut",
                stagger: {
                  from: rands,
                  each: 0.2
                },
                onComplete: () => {
                  odd = !odd;
                  randomTween();
                }
              });
            }

            randomTween()


        })

    },[])

    return (
        <div className='container-fluid'>

            <div className="globe-left">
                <div className="scene"></div>
            </div>
            <div className="globe-right">
                <div className="scene"></div>
            </div>

            <div className="imageCenter">

                
                <div className="title-left">
                    <h1> WEB DEVELOPMENT </h1>
                </div>
                
                <div className="title-right">
                    <h1> AUTOMATION </h1>
                </div>

                <div className="st-left">
                    
                    <div className="box-items">
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                    </div>

                    <span className="left"></span>
                    <span className="top"></span>
                    <span className="bottom"></span>
                    <img src="./img/pic1.jpg" alt="" />
                    <h1> JULLEMYTH </h1>
                </div>
                <div className="st-right">

                    <div className="box-items">
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                        <div className="box"></div>
                    </div>

                    <span className="right"></span>
                    <span className="top"></span>
                    <span className="bottom"></span>
                    <img src="./img/pic2.jpg" alt="" />
                    <h1> JULLEMYTH </h1>
                </div>
            </div>

        </div>
    )
}

export default Profile1