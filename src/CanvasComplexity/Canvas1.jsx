import React, { useEffect } from 'react'
import gsap from 'gsap'
import Globe from 'globe.gl';

function Canvas1() {

    useEffect(() => {


        // Globe Viz
        // const N = 300;
        // const gData = [...Array(N).keys()].map(() => ({
        //   lat: (Math.random() - 0.5) * 180,
        //   lng: (Math.random() - 0.5) * 360,
        //   size: Math.random() / 3,
        //   color: ['red','blue'][Math.round(Math.random() * 3)],
        // }));
    
        // const world = Globe()
        //   .globeImageUrl('https://unpkg.com/three-globe@2.24.6/example/img/earth-night.jpg')
        //   .pointsData(gData)
        //   .pointAltitude('size')
        //   .pointColor('color')
        // (document.getElementById('globeViz'))

        // world.controls().autoRotate = true;
        // world.controls().autoRotateSpeed = 0.6;

        // window.addEventListener('resize', (event) => {
        //     world.width([event.target.innerWidth])
        //     world.height([event.target.innerHeight])
        //   });

    },[])

    return (
        <div className='container-fluid'>

            {/* <div id="globeViz"></div> */}
            


        </div>
    )
}

export default Canvas1