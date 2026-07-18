//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from 'cannon-es';

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        //カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();

        //物理空間の作成
        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
        //摩擦係数、反発係数の作成
        world.defaultContactMaterial.restitution = 0.8;
        world.defaultContactMaterial.friction = 0.03;

        //車のボディ
        //物理演算側
        const carBody = new CANNON.Body({ mass: 5 });
        const carBodyShape = new CANNON.Box(new CANNON.Vec3(4, 0.5, 2));
        carBody.addShape(carBodyShape);
        carBody.position.y = 1;
        const vehicle = new CANNON.RigidVehicle({ chassisBody: carBody });


        //Three.js側
        const boxGeometry = new THREE.BoxGeometry(8, 1, 4);
        const boxMaterial = new THREE.MeshNormalMaterial();
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

        this.scene.add(boxMesh);

        //左前輪
        const wheelShape = new CANNON.Sphere(1);
        const frontLeftWheelBody = new CANNON.Body({ mass: 1 });
        frontLeftWheelBody.addShape(wheelShape);
        frontLeftWheelBody.angularDamping = 0.4;

        vehicle.addWheel({
            body: frontLeftWheelBody,
            position: new CANNON.Vec3(-2, 0, 2.5)
        });

        //右前輪
        const frontRightWheelBody = new CANNON.Body({ mass: 1 });
        frontRightWheelBody.addShape(wheelShape);
        frontRightWheelBody.angularDamping = 0.4;

        vehicle.addWheel({
            body: frontRightWheelBody,
            position: new CANNON.Vec3(-2, 0, -2.5)
        });

        //左後輪
        const backLeftWheelBody = new CANNON.Body({ mass: 1 });
        backLeftWheelBody.addShape(wheelShape);
        backLeftWheelBody.angularDamping = 0.4;

        vehicle.addWheel({
            body: backLeftWheelBody,
            position: new CANNON.Vec3(2, 0, 2.5)
        });

        //右後輪
        const backRightWheelBody = new CANNON.Body({ mass: 1 });
        backRightWheelBody.addShape(wheelShape);
        backRightWheelBody.angularDamping = 0.4;

        vehicle.addWheel({
            body: backRightWheelBody,
            position: new CANNON.Vec3(2, 0, -2.5)
        });

        vehicle.addToWorld(world);


        const wheelGeometry = new THREE.SphereGeometry(1);
        const wheelMaterial = new THREE.MeshNormalMaterial();

        const frontLeftMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(frontLeftMesh);

        const frontRightMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(frontRightMesh);

        const backLeftMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(backLeftMesh);

        const backRightMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.scene.add(backRightMesh);

        //地面の作成
        const phongMaterial = new THREE.MeshPhongMaterial();
        const planeGeometry = new THREE.PlaneGeometry(25, 25);
        const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial);
        planeMesh.material.side = THREE.DoubleSide; // 両面
        planeMesh.rotateX(-Math.PI / 2);

        this.scene.add(planeMesh);

        let wheelForce = 0;
        let steeringValue = 0;

        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowUp":
                    wheelForce = 10;
                    break;

                case "ArrowDown":
                    wheelForce = -10;
                    break;

                case "ArrowLeft":
                    steeringValue = THREE.MathUtils.degToRad(30);
                    break;

                case "ArrowRight":
                    steeringValue = THREE.MathUtils.degToRad(-30);
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowUp":
                    wheelForce = 0;
                    break;

                case "ArrowDown":
                    wheelForce = 0;
                    break;

                case "ArrowLeft":
                    steeringValue = 0;
                    break;

                case "ArrowRight":
                    steeringValue = 0;
                    break;
            }
        });

        //物理演算の空間でも地面を作る
        const planeShape = new CANNON.Plane()
        const planeBody = new CANNON.Body({ mass: 0 })
        planeBody.addShape(planeShape)
        planeBody.position.set(planeMesh.position.x, planeMesh.position.y, planeMesh.position.z);
        planeBody.quaternion.set(planeMesh.quaternion.x, planeMesh.quaternion.y, planeMesh.quaternion.z, planeMesh.quaternion.w);

        world.addBody(planeBody);



        // グリッド表示
        const gridHelper = new THREE.GridHelper(10,);
        this.scene.add(gridHelper);

        // 軸表示
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {

            //物理演算の実行
            world.fixedStep();

            vehicle.setWheelForce(wheelForce, 0);
            vehicle.setWheelForce(wheelForce, 1);

            vehicle.setSteeringValue(steeringValue, 0);
            vehicle.setSteeringValue(steeringValue, 1);
            //実行結果を表示側に反映
            boxMesh.position.set(carBody.position.x, carBody.position.y, carBody.position.z);
            boxMesh.quaternion.set(carBody.quaternion.x, carBody.quaternion.y, carBody.quaternion.z, carBody.quaternion.w);

            frontLeftMesh.position.set(frontLeftWheelBody.position.x, frontLeftWheelBody.position.y, frontLeftWheelBody.position.z);
            frontLeftMesh.quaternion.set(frontLeftWheelBody.quaternion.x, frontLeftWheelBody.quaternion.y, frontLeftWheelBody.quaternion.z, frontLeftWheelBody.quaternion.w);

            frontRightMesh.position.set(frontRightWheelBody.position.x, frontRightWheelBody.position.y, frontRightWheelBody.position.z);
            frontRightMesh.quaternion.set(frontRightWheelBody.quaternion.x, frontRightWheelBody.quaternion.y, frontRightWheelBody.quaternion.z, frontRightWheelBody.quaternion.w);

            backLeftMesh.position.set(backLeftWheelBody.position.x, backLeftWheelBody.position.y, backLeftWheelBody.position.z);
            backLeftMesh.quaternion.set(backLeftWheelBody.quaternion.x, backLeftWheelBody.quaternion.y, backLeftWheelBody.quaternion.z, backLeftWheelBody.quaternion.w);

            backRightMesh.position.set(backRightWheelBody.position.x, backRightWheelBody.position.y, backRightWheelBody.position.z);
            backRightMesh.quaternion.set(backRightWheelBody.quaternion.x, backRightWheelBody.quaternion.y, backRightWheelBody.quaternion.z, backRightWheelBody.quaternion.w);

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(5, 5, 5));
    document.body.appendChild(viewport);
}
