//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private snowCloud!: THREE.Points;
    private sakuraCloud!: THREE.Points;
    private starCloud!: THREE.Points;
    private snowParticleVelocity!: THREE.Vector3[];
    private sakuraParticleVelocity!: THREE.Vector3[];
    private starParticleVelocity!: THREE.Vector3[];

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x000000));
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

        const createParticles = () => {
            //ジオメトリの作成
            const snowGeometry = new THREE.BufferGeometry();
            const sakuraGeometry = new THREE.BufferGeometry();
            const starGeometry = new THREE.BufferGeometry();
            //マテリアルの作成
            const textureLoader = new THREE.TextureLoader();
            const snowTexture = textureLoader.load('./src/snowflake.png');
            const sakuraTexture = textureLoader.load('./src/sakura.png');
            const starTexture = textureLoader.load('./src/star.png');
            
            const snowMaterial = new THREE.PointsMaterial({ size: 1, map: snowTexture, blending: THREE.AdditiveBlending, color: 0xffffff, depthWrite: false, transparent: true, opacity: 0.5 });
            const sakuraMaterial = new THREE.PointsMaterial({ size: 1, map: sakuraTexture, blending: THREE.AdditiveBlending, color: 0xffffff, depthWrite: false, transparent: true, opacity: 0.5 });
            const starMaterial = new THREE.PointsMaterial({ size: 1, map: starTexture, blending: THREE.AdditiveBlending, color: 0xffffff, depthWrite: false, transparent: true, opacity: 0.5 });
            //particleの作成
            this.snowParticleVelocity = [];
            this.sakuraParticleVelocity = [];
            this.starParticleVelocity = [];

            const snowParticleNum = 350; // パーティクルの数
            const snowPositions = new Float32Array(snowParticleNum * 3);
            let snowParticleIndex = 0;
            for (let i = 0; i <= snowParticleNum; i++) {
                snowPositions[snowParticleIndex++] = Math.random() * 10 - 5; // x座標
                snowPositions[snowParticleIndex++] = Math.random() * 10 - 5;; // y座標
                snowPositions[snowParticleIndex++] = Math.random() * 10 - 5;; // z座標
                this.snowParticleVelocity.push(new THREE.Vector3(0, -Math.random() * 0.5 - 0.05, 0));
            }

            const sakuraParticleNum = 250; // パーティクルの数
            const sakuraPositions = new Float32Array(sakuraParticleNum * 3);
            let sakuraParticleIndex = 0;
            for (let i = 0; i <= sakuraParticleNum; i++) {
                sakuraPositions[sakuraParticleIndex++] = Math.random() * 10 - 5; // x座標
                sakuraPositions[sakuraParticleIndex++] = Math.random() * 10 - 5;; // y座標
                sakuraPositions[sakuraParticleIndex++] = Math.random() * 10 - 5;; // z座標
                this.sakuraParticleVelocity.push(new THREE.Vector3(0, -Math.random() * 0.5 - 0.05, 0));
            }

            const starParticleNum = 150; // パーティクルの数
            const starPositions = new Float32Array(starParticleNum * 3);
            let starParticleIndex = 0;
            for (let i = 0; i <= starParticleNum; i++) {
                starPositions[starParticleIndex++] = Math.random() * 10 - 5; // x座標
                starPositions[starParticleIndex++] = Math.random() * 10 - 5;; // y座標
                starPositions[starParticleIndex++] = Math.random() * 10 - 5;; // z座標
                this.starParticleVelocity.push(new THREE.Vector3(0, -Math.random() * 0.5 - 0.05, 0));
            }
            snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
            sakuraGeometry.setAttribute('position', new THREE.BufferAttribute(sakuraPositions, 3));
            starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
            //THREE.Pointsの作成
            this.snowCloud = new THREE.Points(snowGeometry, snowMaterial);
            this.sakuraCloud = new THREE.Points(sakuraGeometry, sakuraMaterial);
            this.starCloud = new THREE.Points(starGeometry, starMaterial);
            //シーンへの追加
            this.scene.add(this.snowCloud);
            this.scene.add(this.sakuraCloud);
            this.scene.add(this.starCloud);
        }
        createParticles();


        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const timer = new THREE.Timer();
        const update: FrameRequestCallback = (_time) => {
            timer.update(); //タイマーの更新
            const deltaTime = timer.getDelta();
            const snowSpeed = 8.0;
            const snowGeom = this.snowCloud.geometry as THREE.BufferGeometry;
            const snowPositions = snowGeom.getAttribute("position") as THREE.BufferAttribute;

            for (let i = 0; i < snowPositions.count; i++) {
                snowPositions.setY(i, snowPositions.getY(i) + this.snowParticleVelocity[i].y * snowSpeed * deltaTime);

                if (snowPositions.getY(i) < -5) {
                    snowPositions.setY(i, 5);
                    snowPositions.setX(i, Math.random() * 10 - 5);
                    snowPositions.setZ(i, Math.random() * 10 - 5);
                }
            }

            const sakuraSpeed = 5.0;
            const sakuraGeom = this.sakuraCloud.geometry as THREE.BufferGeometry;
            const sakuraPositions = sakuraGeom.getAttribute("position") as THREE.BufferAttribute;

            for (let i = 0; i < sakuraPositions.count; i++) {
                sakuraPositions.setY(i, sakuraPositions.getY(i) + this.sakuraParticleVelocity[i].y * sakuraSpeed * deltaTime);

                if (sakuraPositions.getY(i) < -5) {
                    sakuraPositions.setY(i, 5);
                    sakuraPositions.setX(i, Math.random() * 10 - 5);
                    sakuraPositions.setZ(i, Math.random() * 10 - 5);
                }
            }

            const starSpeed = 2;
            const starGeom = this.starCloud.geometry as THREE.BufferGeometry;
            const starPositions = starGeom.getAttribute("position") as THREE.BufferAttribute;

            for (let i = 0; i < starPositions.count; i++) {
                starPositions.setY(i, starPositions.getY(i) + this.starParticleVelocity[i].y * starSpeed * deltaTime);

                if (starPositions.getY(i) < -5) {
                    starPositions.setY(i, 5);
                    starPositions.setX(i, Math.random() * 10 - 5);
                    starPositions.setZ(i, Math.random() * 10 - 5);
                }
            }
            this.snowCloud.position.x = 0;
            this.sakuraCloud.position.x = -5;
            this.starCloud.position.x = 5;
            snowPositions.needsUpdate = true;
            sakuraPositions.needsUpdate = true;
            starPositions.needsUpdate = true;
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 10));
    document.body.appendChild(viewport);
}
