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
        world.defaultContactMaterial.friction = 0.01;
        world.defaultContactMaterial.restitution = 0.9;

        //立方体の作成
        const geometry = new THREE.BoxGeometry(0.5, 1, 0.2);
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

        const cubeMeshes: THREE.Mesh[] = [];
        const cubeBodies: CANNON.Body[] = [];

        const dominoNum = 45;
        const radius = 4;

        for (let i = 0; i < dominoNum; i++) {

            const angle = Math.PI * 2 * i / dominoNum;

            // Three.js側
            const cube = new THREE.Mesh(geometry, material);

            cube.position.set(radius * Math.cos(angle),0.5, radius * Math.sin(angle));

            this.scene.add(cube);
            cubeMeshes.push(cube);

            // 物理演算側
            const cubeShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.5, 0.1));
            //重さの設定
            const cubeBody = new CANNON.Body({ mass: 1 });

            cubeBody.addShape(cubeShape);

            //物理円座表の空間の立方体の位置情報
            cubeBody.position.set(cube.position.x,cube.position.y,cube.position.z);

            //円周に沿って並ぶようにする
            cube.lookAt(radius * Math.cos(angle + 0.1),0.5,radius * Math.sin(angle + 0.1));

            cubeBody.quaternion.set(cube.quaternion.x,cube.quaternion.y,cube.quaternion.z,cube.quaternion.w);

            world.addBody(cubeBody);
            cubeBodies.push(cubeBody);
        }

        cubeMeshes[0].rotateX(Math.PI / 6);
        cubeBodies[0].quaternion.set(cubeMeshes[0].quaternion.x,cubeMeshes[0].quaternion.y,cubeMeshes[0].quaternion.z,cubeMeshes[0].quaternion.w);

        //地面の作成
        const phongMaterial = new THREE.MeshPhongMaterial();
        const planeGeometry = new THREE.PlaneGeometry(25, 25);
        const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial);
        planeMesh.material.side = THREE.DoubleSide; // 両面
        planeMesh.rotateX(-Math.PI / 2);

        this.scene.add(planeMesh);

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

            //実行結果を表示側に反映
            for (let i = 0; i < dominoNum; i++) {
                cubeMeshes[i].position.set(cubeBodies[i].position.x,cubeBodies[i].position.y,cubeBodies[i].position.z);
                cubeMeshes[i].quaternion.set(cubeBodies[i].quaternion.x,cubeBodies[i].quaternion.y,cubeBodies[i].quaternion.z,cubeBodies[i].quaternion.w);
            }

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
