//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as TWEEN from "@tweenjs/tween.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private cloud!: THREE.Points;

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

        const group = new TWEEN.Group();

        const createParticles = () => {
            //ジオメトリの作成
            const geometry = new THREE.BufferGeometry();
            //マテリアルの作成
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load('./src/redlight.png');
            const material = new THREE.PointsMaterial({ size: 1, map: texture, blending: THREE.AdditiveBlending, color: 0xffffff, depthWrite: false, transparent: true, opacity: 0.5 });

            const particleNum = 1000; // パーティクルの数
            const positions = new Float32Array(particleNum * 3);
            let particleIndex = 0;
            for (let i = 0; i < particleNum; i++) {
                positions[particleIndex++] = Math.random() * 10 - 5; // x座標
                positions[particleIndex++] = Math.random() * 10 - 5;; // y座標
                positions[particleIndex++] = Math.random() * 10 - 5;; // z座標
                const tweeninfo = {x: 0,y: 0,z: 0,index: i};

                const updateParticle = () => {
                    const geometry = this.cloud.geometry as THREE.BufferGeometry;
                    const positions = geometry.getAttribute("position");
                    positions.needsUpdate = true;

                    positions.setX(tweeninfo.index, tweeninfo.x);
                    positions.setY(tweeninfo.index, tweeninfo.y);
                    positions.setZ(tweeninfo.index, tweeninfo.z);
                }

                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;

                const r = 5;

                const goal = {
                    x: r * Math.sin(phi) * Math.cos(theta),
                    y: r * Math.cos(phi),
                    z: r * Math.sin(phi) * Math.sin(theta)
                };

                const tween1 = new TWEEN.Tween(tweeninfo).delay(500).to(goal, 1000).easing(TWEEN.Easing.Elastic.Out).onUpdate(updateParticle);
                const tween2 = new TWEEN.Tween(tweeninfo).delay(500).to({x: 0,y: 0,z: 0}, 1000).easing(TWEEN.Easing.Elastic.Out).onUpdate(updateParticle);

                tween1.chain(tween2);
                tween2.chain(tween1);

                group.add(tween1);
                group.add(tween2);

                tween1.start();
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            //THREE.Pointsの作成
            this.cloud = new THREE.Points(geometry, material);
            //シーンへの追加
            this.scene.add(this.cloud);

        }

        createParticles();

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {

            group.update(_time);

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
