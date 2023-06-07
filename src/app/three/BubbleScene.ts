import * as THREE from 'three';
import FresnelShader from './shaders/FresnelShader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier';

// MAIN
export function createBubbleScene(container: HTMLDivElement) {

    const scene = new THREE.Scene();
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    const camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0,0,400);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor( 0x000000, 0 ); 
    container.appendChild( renderer.domElement );

    // LIGHT
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,250,0);
    scene.add(light);

    // SKYBOX
    var imagePrefix = "./assets/space_skybox/";
    var directions = ["left", "right", "front", "back", "top", "bottom"];
    var imageSuffix = ".png";
    
    var skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
    
    var loader = new THREE.TextureLoader();
    var materialArray: THREE.MeshBasicMaterial[] = [];
    
    directions.forEach((direction) => {
        materialArray.push(new THREE.MeshBasicMaterial({
            map: loader.load(imagePrefix + direction + imageSuffix),
            side: THREE.BackSide
        }));
    });
    
    var skyBox = new THREE.Mesh(skyGeometry, materialArray);
    skyBox.name = "Skybox";
    scene.add(skyBox);

    // REFRACT SPHERE CAMERA
    let cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter
    });
    const refractSphereCamera = new THREE.CubeCamera(0.1, 5000, cubeRenderTarget);
            
    var fShader = FresnelShader
    
    // create custom material for the shader
    const firstMaterial = new THREE.ShaderMaterial( 
    {
        uniforms: 		THREE.UniformsUtils.clone(fShader.uniforms),
        vertexShader:   fShader.vertexShader,
        fragmentShader: fShader.fragmentShader,
    }   );

    const secondMaterial = new THREE.ShaderMaterial( 
    {
        uniforms: 		THREE.UniformsUtils.clone(fShader.uniforms),
        vertexShader:   fShader.vertexShader,
        fragmentShader: fShader.fragmentShader,
    }   );
    
    // SPHERE
    const sphereRadius = 35;
    var sphereGeometry = new THREE.SphereGeometry( sphereRadius, 64, 32 );
    // tessellate modifier here
    const tessellateModifier = new TessellateModifier(2, 128);
    sphereGeometry = tessellateModifier.modify(sphereGeometry);

    const numFaces = sphereGeometry.attributes.position.count / 3;
    const vel = new Float32Array( numFaces * 3 * 3);

    for (let f = 0; f < numFaces; f++) {
        const index = 9 * f

        for (let i = 0; i < 3; i++) {
            let dirX = Math.random() * 0.1
            let dirY = Math.random() * 0.1
            let dirZ = Math.random() * 0.1

            vel[index + (3 * i)] = dirX;
            vel[index + (3 * i) + 1] = dirY;
            vel[index + (3 * i) + 2] = dirZ;
        }
    }
    sphereGeometry.setAttribute('vel', new THREE.BufferAttribute(vel, 3));

    var position_clone = JSON.parse(JSON.stringify(sphereGeometry.attributes.position.array)) as Float32Array;
    var normals_clone = JSON.parse(JSON.stringify(sphereGeometry.attributes.normal.array)) as Float32Array;

    // CREATING RIPPLE ANIMATION SETUP
    const verticesCount = sphereGeometry.attributes.position.count;
    
    // POSITIONING SPHERES
    let sphereDepth = 100
    const firstBubble = new THREE.Mesh( sphereGeometry, firstMaterial );
    const secondBubble = new THREE.Mesh( sphereGeometry, secondMaterial );

    var distance = new THREE.Vector3(0, 0, sphereDepth).length();  // distance between camera and mesh back left edge
    var verticalFOV = THREE.MathUtils.degToRad( VIEW_ANGLE );
    var visibleHeight = 2 * Math.tan( verticalFOV / 2 ) * distance;
    var visibleWidth = visibleHeight * ASPECT;

    const startY = -visibleHeight - sphereRadius * 2.5;
    const endY = visibleHeight + sphereRadius * 2.5;

    // Position the sphere at the bottom of the screen
    firstBubble.position.set(visibleWidth, startY, sphereDepth);
    secondBubble.position.set(0, startY, sphereDepth);

    scene.add(firstBubble);
    scene.add(secondBubble);
    // SPHERE TEXT
    let fontLoader = new FontLoader();
    var textMesh: THREE.Mesh
    fontLoader.load( './assets/three_fonts/helvetiker_bold.typeface.json', ( font ) => {
        let geometry = new TextGeometry( 'Javascript', {
            font: font,
            size: 20,
            height: 5,
        });
        geometry.computeBoundingBox();
        var width = 100
        if (geometry.boundingBox)
            width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        
        let material = new THREE.MeshBasicMaterial({ color: 0x163898 });
        textMesh = new THREE.Mesh( geometry, material );
    
        // position the text in front of the sphere and center it
        textMesh.position.set(-width/2, 0, 200);
        scene.add( textMesh );
    });

    scene.add(refractSphereCamera );
    refractSphereCamera.position.set(0, 0, firstBubble.position.z + 50);

    var firstExplode = false;
    var secondExplode = false;
    document.addEventListener("keydown", (e) => {
        if(e.key == "k") {
            firstExplode = true;
            secondExplode = true;
        }
        console.log("Key pressed");
    });

    function render() 
    {
        renderer.render( scene, camera );
    }
    
    var firstMoving = true;
    var secondMoving = false;
    var bubbleDamping = 2;
    function animate() 
    {
        requestAnimationFrame(animate);
        console.log("hit");
        firstBubble.visible = false;
        secondBubble.visible = false;
        if (textMesh)
            textMesh.visible = false;


        // Update the sphere position
        if (firstBubble.position.y > sphereRadius && secondMoving == false)
            secondMoving = true;
        if (secondBubble.position.y > sphereRadius && firstMoving == false)
            firstMoving = true;
        
        if (firstMoving && firstExplode == false)
            firstBubble.translateY(0.3);
        if (secondMoving && secondExplode == false)
            secondBubble.translateY(0.3);

        if (firstBubble.position.y > endY) {
            firstMoving = false;
            firstBubble.position.y = startY
        }
        if (secondBubble.position.y > endY) {
            secondMoving = false;
            secondBubble.position.y = startY
        }

        let firstProportion: number
        if (firstBubble.position.y < 0)
            firstProportion = (firstBubble.position.y - startY)/(-startY);
        else
            firstProportion = (firstBubble.position.y)/(endY)

        // Update the sphere opacity
        if (firstBubble.position.y < 0 && firstProportion < 0.1) {
            firstMaterial.uniforms.opacity.value = firstProportion * 10.0;
        } else {
            firstMaterial.uniforms.opacity.value = 1.0;
        }

        let secondProportion: number
        if (secondBubble.position.y < sphereRadius)
            secondProportion = (secondBubble.position.y - startY)/(-startY);
        else
            secondProportion = (secondBubble.position.y)/(endY)

        // Update the sphere opacity
        if (secondBubble.position.y < 0 && secondProportion < 0.1) {
            secondMaterial.uniforms.opacity.value = secondProportion * 10.0;
        } else {
            secondMaterial.uniforms.opacity.value = 1.0;
        }

        // Create surface animation
        const now = Date.now() / 200;
        // iterate all vertices
        for (let i = 0; i < verticesCount; i++) {
            // indices
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            // use uvs to calculate wave
            const uX = sphereGeometry.attributes.uv.getX(i) * Math.PI * 16
            const uY = sphereGeometry.attributes.uv.getY(i) * Math.PI * 16

            // calculate current vertex wave height
            const xangle = (uX + now)
            const xsin = Math.sin(xangle) * bubbleDamping
            const yangle = (uY + now)
            const ycos = Math.cos(yangle) * bubbleDamping

            // set new position
            sphereGeometry.attributes.position.setX(i, position_clone[ix] + normals_clone[ix] * (xsin + ycos))
            sphereGeometry.attributes.position.setY(i, position_clone[iy] + normals_clone[iy] * (xsin + ycos))
            sphereGeometry.attributes.position.setZ(i, position_clone[iz] + normals_clone[iz] * (xsin + ycos))
        }
        sphereGeometry.computeVertexNormals();
        sphereGeometry.attributes.position.needsUpdate = true;
        
        // Update refraction material renderer camera
        refractSphereCamera.update(renderer, scene);
        firstBubble.visible = true;
        secondBubble.visible = true;
        if (textMesh)
            textMesh.visible = true;
        (firstBubble.material as THREE.ShaderMaterial).uniforms['tCube'].value = refractSphereCamera.renderTarget.texture;
        (secondBubble.material as THREE.ShaderMaterial).uniforms['tCube'].value = refractSphereCamera.renderTarget.texture;
        if (firstExplode)
            firstMaterial.uniforms.amplitude.value += 1.0;
        render();
    }

    animate();

}