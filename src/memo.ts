// 24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    // private geometry!: THREE.BufferGeometry;
    // private material!: THREE.Material;
    // private cube!: THREE.Mesh;
    private light!: THREE.Light;
    private umbrellas!: THREE.Group[];

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));

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

        // this.geometry = new THREE.BoxGeometry(1, 1, 1);
        // this.material = new THREE.MeshLambertMaterial({ color: 0x55ff00 });
        // this.cube = new THREE.Mesh(this.geometry, this.material);
        // this.scene.add(this.cube);

//     const addRandomObject = () =>{
//     //Cubeのサイズを決める
// 　　 const Size: number = Math.random() * 1.0 + 0.25;
//     //0,1,2のランダム
//     const randval = Math.floor(Math.random()*3);
//      //Geometryを作成する
//     let addGeometry: THREE.BufferGeometry;

//     switch(randval){
//         case 0:
//             addGeometry = new THREE.BoxGeometry(Size,Size,Size);//追加分
//             break;
//         case 1:
//             addGeometry = new THREE.SphereGeometry(Size,32,16);
//             break;
//         case 2:
//             addGeometry = new THREE.CylinderGeometry(Size,Size,Size,32,1,false);
//             break;
//         default:
//             throw new Error("invailed");
//     }
//     //マテリアルの作成
//     const meshMaterial: THREE.Material = new THREE.MeshNormalMaterial({side:THREE.DoubleSide});
//     //Cubeオブジェクトを生成する
//     const addObject: THREE.Mesh = new THREE.Mesh(addGeometry, meshMaterial);

//     //Cubeオブジェクトのプロパティを設定する
//     addObject.name = "cube-" + this.scene.children.length;

//     //Cubeオブジェクトを移動する
//     addObject.position.x = Math.round((Math.random() * 5)) - 2.5;
//     addObject.position.y = Math.round((Math.random() * 5)) - 2.5;
//     addObject.position.z = Math.round((Math.random() * 5)) - 2.5;

//     //Cubeオブジェクトを回転させる
//     addObject.rotation.x = THREE.MathUtils.degToRad(Math.random() * 45);
//     addObject.rotation.y = THREE.MathUtils.degToRad(Math.random() * 45);

//     //シーンに追加する
//     this.scene.add(addObject);
//     }

//     for (let i: number = 0; i < 30; i++) {
//         addRandomObject();
//     }

    const createUmbrella = (): THREE.Group => {

    const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

    // =====================
    // ① 布（Cone）
    // =====================
    const cone = new THREE.ConeGeometry(1, 1.5, 32);
    const coneMesh = new THREE.Mesh(cone, material);
    coneMesh.rotation.x = Math.PI;
    coneMesh.position.y = 1.5; // 上に配置

    // =====================
    // ② 柄（Capsule）
    // =====================
    const capsule = new THREE.CapsuleGeometry(0.1, 2, 8, 16);
    const capsuleMesh = new THREE.Mesh(capsule, material);

    capsuleMesh.position.y = 0; // 中央

    // =====================
    // ③ 持ち手（Extrude）
    // =====================
const shape = new THREE.Shape();

shape.moveTo(0, 0);
shape.quadraticCurveTo(-0.3, -0.5, 0, -1);
shape.quadraticCurveTo(0.5, -1, 0.5, -0.5);

const extrude = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: false
});
    const extrudeMesh = new THREE.Mesh(extrude, material);

    // 向きを調整
    extrudeMesh.position.y = -1.5;

    // =====================
    // Group化
    // =====================
    const umbrella = new THREE.Group();

    umbrella.add(coneMesh);
    umbrella.add(capsuleMesh);
    umbrella.add(extrudeMesh);

    return umbrella;
}

for(let i = 0; i < 20; i++){
    const u = createUmbrella();

    u.position.set(
        Math.random()*5 - 2.5,
        Math.random()*5 - 2.5,
        Math.random()*5 - 2.5
    );

    this.scene.add(u);
    this.umbrellas.push(u);
}

// console.log("Hello");//ログの書き出し

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        // const update: FrameRequestCallback = (_time) => {
        //     //this.cube.rotateX(0.01);

        //     requestAnimationFrame(update);
        // }
        // requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(-3, 3, 3));
    document.body.appendChild(viewport);
}
