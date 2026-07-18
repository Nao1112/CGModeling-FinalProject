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

        //帽子
        const hatPoints: THREE.Vector2[] = [];
        // つば
        hatPoints.push(new THREE.Vector2(2.8, 0.0));
        hatPoints.push(new THREE.Vector2(2.6, 0.04));
        hatPoints.push(new THREE.Vector2(2.4, 0.08));
        hatPoints.push(new THREE.Vector2(2.0, 0.10));
        // 立ち上がり
        hatPoints.push(new THREE.Vector2(1.8, 0.2));
        hatPoints.push(new THREE.Vector2(1.5, 0.4));
        hatPoints.push(new THREE.Vector2(1.3, 0.8));
        hatPoints.push(new THREE.Vector2(1.1, 1.4));
        hatPoints.push(new THREE.Vector2(1.0, 1.8));
        // 上部
        hatPoints.push(new THREE.Vector2(0.7, 2.0));
        hatPoints.push(new THREE.Vector2(0.5, 2.04));
        hatPoints.push(new THREE.Vector2(0.3, 2.08));
        hatPoints.push(new THREE.Vector2(0.0, 2.10));

        const hatGeometry = new THREE.LatheGeometry(hatPoints);
        const hatMaterial = new THREE.MeshPhongMaterial({ color: 0xe6c27a });

        const hat = new THREE.Mesh(hatGeometry, hatMaterial);

        hat.position.set(-3, -1.5, 0);
        this.scene.add(hat);

        //リボン
        const ribbonPoints: THREE.Vector2[] = [];

        ribbonPoints.push(new THREE.Vector2(1.85, 0.0));
        ribbonPoints.push(new THREE.Vector2(1.55, 0.2));
        ribbonPoints.push(new THREE.Vector2(1.35, 0.4));

        const ribbonGeometry = new THREE.LatheGeometry(ribbonPoints);
        const ribbonMaterial = new THREE.MeshPhongMaterial({ color: 0xc02020 });

        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);

        ribbon.position.set(-3, -1.3, 0);
        this.scene.add(ribbon);

        //花びら
        const drawHanabira = () => {
            const hanabiraShape = new THREE.Shape();

            hanabiraShape.moveTo(0, 0);

            hanabiraShape.lineTo(0.1, 0.3);
            hanabiraShape.lineTo(0.2, 0.8);
            hanabiraShape.lineTo(0.15, 1.2);
            hanabiraShape.lineTo(0, 1.4);
            hanabiraShape.lineTo(-0.15, 1.2);
            hanabiraShape.lineTo(-0.2, 0.8);
            hanabiraShape.lineTo(-0.1, 0.3);

            return hanabiraShape;
        }
        const hanabiraGeometry = new THREE.ExtrudeGeometry(drawHanabira(), {
            depth: 0.2,
            bevelEnabled: true,
        });
        const hanabiraMaterial = new THREE.MeshPhongMaterial({ color: 0xffd11a });

        const flower = new THREE.Group();

        const hanabiraCount = 20;
        const radius = 0.5;

        for (let i = 0; i < hanabiraCount; i++) {
            const angle = i * Math.PI * 2 / hanabiraCount;

            const hanabira = new THREE.Mesh(hanabiraGeometry, hanabiraMaterial);

            hanabira.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            // 外側を向くようにする
            hanabira.rotation.z = angle - Math.PI / 2;
            flower.add(hanabira);
        }

        //花の中心
        const centerShape = new THREE.Shape();

        centerShape.absarc(0,0,0.8,0,Math.PI * 2);

        const centerGeometry =new THREE.ExtrudeGeometry(centerShape, {
                depth: 0.4,
                bevelEnabled: true
            });
        const centerMaterial = new THREE.MeshPhongMaterial({ color: 0x4a2410 });

        const center =new THREE.Mesh(centerGeometry,centerMaterial);
        center.position.z = -0.1;
        flower.add(center);

        //茎
        const kukiGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
        const kukiMaterial = new THREE.MeshPhongMaterial({color: 0x228822});
        const kuki =new THREE.Mesh(kukiGeometry,kukiMaterial);

        kuki.position.y = -3;
        kuki.position.z = 0.1;

        flower.add(kuki);
        flower.position.set(3, 0, 0);
        this.scene.add(flower);

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

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(1, 2, 6));
    document.body.appendChild(viewport);
}
