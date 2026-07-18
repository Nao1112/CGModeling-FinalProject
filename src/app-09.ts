//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private cloud!: THREE.Points[];

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

        const generateSprite = (color: string) => {
            //新しいキャンバスの作成
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;

            //円形のグラデーションの作成
            let context = canvas.getContext('2d')!;
            let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            gradient.addColorStop(0.2, color);

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            //テクスチャの生成
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }

        const createPoints = (geom: THREE.BufferGeometry, color: string) => {
            geom.deleteAttribute('uv');
            const material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.5,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                map: generateSprite(color)
            });
            return new THREE.Points(geom, material);
        }
        this.cloud = [];

        const blue = createPoints(
            new THREE.TorusGeometry(4, 0.4, 6, 12),
            "rgba(0,0,255,0.7)"
        );

        const red = createPoints(
            new THREE.TorusGeometry(4, 0.4, 6, 12),
            "rgba(255,0,0,0.7)"
        );

        const green = createPoints(
            new THREE.TorusGeometry(4, 0.4, 6, 12),
            "rgba(0, 255, 0, 0.7)"
        );

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
            const speed = 0.7;
            this.scene.add(blue);
            this.scene.add(red);
            this.scene.add(green);

            this.cloud.push(blue);
            this.cloud.push(red);
            this.cloud.push(green);
            this.cloud[0].rotation.x += 1.0 * deltaTime * speed;
            this.cloud[0].position.x = Math.sin(_time * 0.001) * 5;
            this.cloud[0].scale.setScalar(1 + 0.3 * Math.sin(_time * 0.001));
            this.cloud[1].rotation.y += 2.0 * deltaTime * speed;
            this.cloud[1].position.y = Math.sin(_time * 0.001) * 5;
            this.cloud[1].scale.setScalar(1 + 0.3 * Math.sin(_time * 0.001 + 1));
            this.cloud[2].rotation.z += 1.5 * deltaTime * speed;
            this.cloud[2].position.z = Math.sin(_time * 0.001) * 5;
            this.cloud[2].scale.setScalar(1 + 0.3 * Math.sin(_time * 0.001 + 2));
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
