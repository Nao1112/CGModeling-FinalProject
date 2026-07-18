//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private fallSakura!: THREE.Points;
    private sakuraVelocity!: THREE.Vector3[];
    private blossomPoints: THREE.Vector3[] = [];
    private snow!: THREE.Points;
    private snowVelocity!: THREE.Vector3[];
    private sunAndMoon!: THREE.Sprite;
    private spotLight!: THREE.SpotLight;
    private ambientLight!: THREE.AmbientLight;
    private asayake!: THREE.Mesh;

    constructor() {
    }

    // 画面部分の作成(表示する枠ごとに)
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

            this.updateSky(camera);

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
        this.scene.background = new THREE.Color(0xbfdfff);

        //地面の作成
        const createGround = () => {
            const geometry = new THREE.PlaneGeometry(25, 25);
            const material = new THREE.MeshPhongMaterial({ color: 0x55aa55 });
            const ground = new THREE.Mesh(geometry, material);

            ground.rotation.x = -Math.PI / 2;

            this.scene.add(ground);
        }

        //落ちてるさくら
        const createGroundSakura = () => {
            const texture = new THREE.TextureLoader().load("./sakura.png");
            const material = new THREE.PointsMaterial({ map: texture, size: 0.5, transparent: true, opacity: 0.8, depthWrite: false });

            const positions = [];

            for (let i = 0; i < 1000; i++) {
                positions.push((Math.random() - 0.5) * 25, 0.01, (Math.random() - 0.5) * 25);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const petals = new THREE.Points(geometry, material);

            this.scene.add(petals);
        }

        //木の作成
        const createTree = () => {
            const tree = new THREE.Group();

            //幹
            const mikiGeometry = new THREE.CylinderGeometry(0.25, 0.35, 3, 16);
            const mikiMaterial = new THREE.MeshPhongMaterial({ color: 0x3d2b1f });
            const miki = new THREE.Mesh(mikiGeometry, mikiMaterial);

            miki.position.y = 1.5;

            tree.add(miki);

            //枝
            const createBranch = (parent: THREE.Group, start: THREE.Vector3, length: number, theta: number, phi: number, level: number
            ) => {

                if (level <= 0) {
                    return;
                }

                const radius = 0.03 + level * 0.04;
                const geometry = new THREE.CylinderGeometry(radius * 0.6, radius, length, 8);
                const material = new THREE.MeshPhongMaterial({ color: 0x3d2b1f });
                const branch = new THREE.Mesh(geometry, material);

                parent.add(branch);

                const dir = new THREE.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(theta), Math.sin(phi) * Math.cos(theta));
                const end = start.clone().add(dir.clone().multiplyScalar(length));

                if (level <= 2) {
                    const flowerNum = 6;

                    for (let i = 0; i < flowerNum; i++) {
                        const t = Math.random();
                        const p = start.clone().lerp(end, t);

                        // 枝の周りにも少し散らす
                        p.x += (Math.random() - 0.5) * 0.25;
                        p.y += (Math.random() - 0.5) * 0.25;
                        p.z += (Math.random() - 0.5) * 0.25;

                        this.blossomPoints.push(p);
                    }
                }

                branch.position.copy(start.clone().add(end).multiplyScalar(0.5));
                branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

                const angle = 0.45 + (Math.random() - 0.5) * 0.2;
                const nextLength = length * (0.65 + Math.random() * 0.15);

                createBranch(parent, end, nextLength, theta + angle, phi + angle, level - 1);
                createBranch(parent, end, nextLength * 0.9, theta + angle * 0.7, phi, level - 1);
                createBranch(parent, end, nextLength, theta + angle, phi - angle, level - 1);

                if (level == 1) {
                    const thinBranchNum = 4;

                    for (let i = 0; i < thinBranchNum; i++) {
                        const thinBranchTheta = theta + 0.2 + Math.random() * 0.4;
                        const thinBranchPhi = phi + (Math.random() - 0.5) * 1.2;
                        const thinBranchLength = 0.35 + Math.random() * 0.2;

                        createThinBranch(parent, end, thinBranchLength, thinBranchTheta, thinBranchPhi);
                    }
                }
            }

            //細枝
            const createThinBranch = (parent: THREE.Group, start: THREE.Vector3, length: number, theta: number, phi: number) => {
                const geometry = new THREE.CylinderGeometry(0.012, 0.02, length, 6);
                const material = new THREE.MeshPhongMaterial({ color: 0x3d2b1f });
                const thin = new THREE.Mesh(geometry, material);

                parent.add(thin);

                const dir = new THREE.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(theta), Math.sin(phi) * Math.cos(theta));
                const end = start.clone().add(dir.multiplyScalar(length));

                thin.position.copy(start.clone().add(end).multiplyScalar(0.5));
                thin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

                // 花房の位置
                this.blossomPoints.push(end.clone());
            };

            const branchNum = 16;

            for (let i = 0; i < branchNum; i++) {
                const phi = i * Math.PI * 2 / branchNum;
                const theta = Math.PI / 2 - 0.4 + Math.random() * 0.8;
                const length = 1.7 + Math.random() * 0.4;
                const startY = 1.2 + Math.random() * 0.8;

                createBranch(tree, new THREE.Vector3(0, startY, 0), length, theta, phi, 4);
            }
            this.scene.add(tree);
        }

        //木についた花
        const createBlossoms = () => {
            const texture = new THREE.TextureLoader().load("./sakura.png");
            const material = new THREE.PointsMaterial({ map: texture, size: 0.3, transparent: true, opacity: 0.8, depthWrite: false });

            const positions: number[] = [];

            // blossomPointごとに花の塊を作る
            for (const p of this.blossomPoints) {
                const cluster = 50;

                for (let i = 0; i < cluster; i++) {
                    const r = Math.random() * Math.random() * 0.15;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI;

                    positions.push(p.x + r * Math.sin(phi) * Math.cos(theta), p.y + r * Math.cos(phi), p.z + r * Math.sin(phi) * Math.sin(theta));
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const blossoms = new THREE.Points(geometry, material);

            this.scene.add(blossoms);
        }

        //落下さくらパーティクル
        const createFallSakura = () => {
            const geometry = new THREE.BufferGeometry();
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load("./sakura.png");

            const material =
                new THREE.PointsMaterial({
                    size: 0.5, map: texture, transparent: true, opacity: 0.8, depthWrite: false
                });

            this.sakuraVelocity = [];

            const particleNum = 600;
            const positions = new Float32Array(particleNum * 3);

            let index = 0;
            for (let i = 0; i < particleNum; i++) {

                const p = this.blossomPoints[Math.floor(Math.random() * this.blossomPoints.length)];

                positions[index++] = p.x + (Math.random() - 0.5) * 0.15;
                positions[index++] = p.y + (Math.random() - 0.5) * 0.15;
                positions[index++] = p.z + (Math.random() - 0.5) * 0.15;

                this.sakuraVelocity.push(
                    new THREE.Vector3(Math.random() * 0.02 - 0.01, -0.02 - Math.random() * 0.02, Math.random() * 0.02 - 0.01)
                );
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            this.fallSakura = new THREE.Points(geometry, material);

            this.scene.add(this.fallSakura);
        }

        //雪パーティクル
        const createSnow = () => {
            const geometry = new THREE.BufferGeometry();
            const texture = new THREE.TextureLoader().load("./snowflake.png");
            const material = new THREE.PointsMaterial({ size: 0.2, map: texture, transparent: true, opacity: 0.9, depthWrite: false });

            this.snowVelocity = [];

            const snowNum = 1000;
            const positions = new Float32Array(snowNum * 3);

            let index = 0;
            for (let i = 0; i < snowNum; i++) {

                positions[index++] = Math.random() * 20 - 10;
                positions[index++] = Math.random() * 10 + 2;
                positions[index++] = Math.random() * 20 - 10;

                this.snowVelocity.push(
                    new THREE.Vector3((Math.random() - 0.5) * 0.01, -0.015 - Math.random() * 0.015, (Math.random() - 0.5) * 0.01)
                );
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            this.snow = new THREE.Points(geometry, material);
            this.snow.visible = false;

            this.scene.add(this.snow);
        }

        //太陽と月
        const createSunAndMoon = () => {
            const texture = new THREE.TextureLoader().load("./sunandmoon.png");
            const material = new THREE.SpriteMaterial({ map: texture});

            this.sunAndMoon = new THREE.Sprite(material);
            this.sunAndMoon.scale.set(4, 4, 1);

            this.sunAndMoon.position.set(0, 12, -30);

            this.scene.add(this.sunAndMoon);
        }

        //朝焼け
        const createAsayake = () => {
            const geometry = new THREE.SphereGeometry(100, 50, 50);

            const colors: number[] = [];

            const position = geometry.attributes.position;
            const bottom = new THREE.Color(0xffaa55);
            const top = new THREE.Color(0x87ceeb);

            for (let i = 0; i < position.count; i++) {
                const y = position.getY(i);
                const h = (y + 100) / 200;
                const c = bottom.clone().lerp(top, h);

                colors.push(c.r, c.g, c.b);
            }

            geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
            const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });

            this.asayake = new THREE.Mesh(geometry, material);

            this.scene.add(this.asayake);
        }

        createGround();
        createGroundSakura();
        createTree();
        createBlossoms();
        createFallSakura();
        createSnow();
        createSunAndMoon();
        createAsayake();

        //ライトの設定

        // 全体を少し照らす
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(this.ambientLight);

        // 太陽光
        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(0, 12, -30);
        this.scene.add(this.light);

        // 桜だけを照らすスポットライト
        this.spotLight = new THREE.SpotLight(0xffc080, 30);
        this.spotLight.position.set(-6, 10, 4);
        this.spotLight.target.position.set(0, 3, 0);
        this.spotLight.angle = Math.PI / 3;
        this.spotLight.penumbra = 1.0;
        this.spotLight.decay = 1.0;
        this.spotLight.distance = 40;

        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const timer = new THREE.Timer();
        const update: FrameRequestCallback = (_time) => {
            timer.update(); //タイマーの更新
            const deltaTime = timer.getDelta();
            let fallSpeed = 5;
            const geom = this.fallSakura.geometry as THREE.BufferGeometry;

            const positions = geom.getAttribute("position") as THREE.BufferAttribute;

            for (let i = 0; i < positions.count; i++) {

                positions.setX(i, positions.getX(i) + this.sakuraVelocity[i].x * fallSpeed * deltaTime);
                positions.setY(i, positions.getY(i) + this.sakuraVelocity[i].y * fallSpeed * deltaTime);
                positions.setZ(i, positions.getZ(i) + this.sakuraVelocity[i].z * fallSpeed * deltaTime);

                if (positions.getY(i) < 0) {
                    const p = this.blossomPoints[Math.floor(Math.random() * this.blossomPoints.length)];

                    positions.setX(i, p.x + (Math.random() - 0.5) * 0.15);
                    positions.setY(i, p.y + (Math.random() - 0.5) * 0.15);
                    positions.setZ(i, p.z + (Math.random() - 0.5) * 0.15);
                }
            }
            positions.needsUpdate = true;
            requestAnimationFrame(update);

            const snowGeom = this.snow.geometry as THREE.BufferGeometry;
            const snowPos = snowGeom.getAttribute("position") as THREE.BufferAttribute;

            for (let i = 0; i < snowPos.count; i++) {

                snowPos.setX(i, snowPos.getX(i) + this.snowVelocity[i].x);
                snowPos.setY(i, snowPos.getY(i) + this.snowVelocity[i].y);
                snowPos.setZ(i, snowPos.getZ(i) + this.snowVelocity[i].z);

                if (snowPos.getY(i) < 0) {
                    snowPos.setX(i, Math.random() * 20 - 10);
                    snowPos.setY(i, Math.random() * 3 + 8);
                    snowPos.setZ(i, Math.random() * 20 - 10);
                }
            }

            snowPos.needsUpdate = true;
        }
        requestAnimationFrame(update);
    }



    private updateSky = (camera: THREE.PerspectiveCamera) => {

        let angle = Math.atan2(camera.position.x, camera.position.z);

        //0～2π に変換
        if (angle < 0) {
            angle += Math.PI * 2;
        }

        // 0～90° 朝
        if (angle < Math.PI / 2) {
            this.scene.background = new THREE.Color(0xbfdfff);
            this.fallSakura.geometry.setDrawRange(0, 300);
            this.snow.visible = false;
            this.sunAndMoon.visible = true;
            (this.sunAndMoon.material as THREE.SpriteMaterial)
                .color.set(0xffb366);
            this.asayake.visible = true;
            this.spotLight.color.set(0xffd0a0);
        }
        // 90～180° 昼
        else if (angle < Math.PI) {
            this.scene.background = new THREE.Color(0x88bbff);
            this.fallSakura.geometry.setDrawRange(0, 600);
            this.snow.visible = false;
            this.sunAndMoon.visible = false;
            this.asayake.visible = false;
            this.spotLight.intensity = 45;
            this.spotLight.color.set(0xffd0a0);
            this.ambientLight.intensity = 0.3;
        }
        // 180～270° 夜
        else if (angle < Math.PI * 1.5) {
            this.scene.background = new THREE.Color(0x050020);
            this.fallSakura.geometry.setDrawRange(0, 450);
            this.snow.visible = false;
            this.sunAndMoon.visible = false;
            this.asayake.visible = false;
            this.spotLight.intensity = 60;
            this.spotLight.color.set(0xffaa33);
            this.ambientLight.intensity = 0.45;
        }
        // 270～360° 雪の夜
        else {
            this.scene.background = new THREE.Color(0x203050);
            this.fallSakura.geometry.setDrawRange(0, 300);
            this.snow.visible = true;
            this.sunAndMoon.visible = true;
            (this.sunAndMoon.material as THREE.SpriteMaterial)
                .color.set(0xf5f8ff);
            this.asayake.visible = false;
            this.spotLight.intensity = 30;
            this.spotLight.color.set(0xe6f3ff);
            this.ambientLight.intensity = 0.3;
        }
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(8, 4.5, 8));
    document.body.appendChild(viewport);
}