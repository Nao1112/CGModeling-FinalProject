//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
        // 頂点座標の定義
        const vertices = new Float32Array([
        // 1つ目の四角形の頂点情報
            1, -1, 0,
            -1,  1, 0,
            -1,  -1, 0,
            1,  1, 0,
        // 2つ目の四角形
            1, -1, 2,
            -1,  1, 2,
            -1,  -1, 2,
            1,  1, 2,
            
        ]);
        //頂点インデックス
        const indices = [ 
            2, 1, 0, 1, 3, 0,
            0, 4, 6, 0, 6, 2,
            1, 2, 5, 6, 5, 2,
            4, 3, 7, 3, 4, 0,
            4, 5, 6, 4, 7, 5,
            5, 3, 1, 7, 3, 5,
        ];
        const colors = new Float32Array([
            0.0, 0.0, 0.0,//黒
            1.0, 1.0, 1.0,//白
            1.0, 0.0, 0.0, //赤
            0.0, 1.0, 0.0, //緑
            0.0, 0.0, 1.0, //青
            1.0, 1.0, 0.0,//イエロー
            0.0, 1.0, 1.0,//シアン
            1.0, 0.0, 1.0,//マゼンタ
        ]);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geometry.setIndex(indices);
        geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3));
        geometry.computeVertexNormals();  

        const material = new THREE.MeshBasicMaterial( { vertexColors:true } );

        const mesh = new THREE.Mesh( geometry, material );
        this.scene.add(mesh);

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
    
        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}
window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 3));
    document.body.appendChild(viewport);
}
