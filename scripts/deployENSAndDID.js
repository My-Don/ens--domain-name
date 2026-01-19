const { ethers } = require("hardhat");
const { namehash } = ethers.utils;

async function main() {
  console.log("🚀 新链部署（完整方案）");

  const [deployer] = await ethers.getSigners();

  // 1. ENSRegistry（必需）
  const ENS = await ethers.getContractFactory("ENSRegistry");
  const ens = await ENS.deploy();
  await ens.waitForDeployment();
  const ensAddress = await ens.getAddress();
  console.log("✅ ENSRegistry:", ensAddress);

  // 2. PublicResolver（必需）
  const PublicResolver = await ethers.getContractFactory("PublicResolver");
  const publicResolver = await PublicResolver.deploy(ens.address, ethers.constants.AddressZero);
  await publicResolver.waitForDeployment();
  const publicResolverAddress = await publicResolver.getAddress();
  console.log("✅ PublicResolver:", publicResolverAddress);

  // 3. EthereumDIDRegistry（可选：仅当需要完整DID功能）
  const needFullDID = process.env.ENABLE_FULL_DID === "true";
  let didRegistry;

  if (needFullDID) {
    console.log("\n⚠️  启用完整DID功能...");
    const EthereumDIDRegistry = await ethers.getContractFactory("EthereumDIDRegistry");
    didRegistry = await EthereumDIDRegistry.deploy();
    await didRegistry.waitForDeployment();
    const didRegistryAddress = await didRegistry.getAddress();
    console.log("✅ EthereumDIDRegistry:", didRegistryAddress);
  } else {
    console.log("\nℹ️  跳过EthereumDIDRegistry（标准场景无需）");
  }

  // 4. 设置域名和DID（通用）
  const domain = "example.eth";
  const subdomain = "test";
  const fullDomain = `${subdomain}.${domain}`;

  // 注册主域名
  await ens.setSubnodeRecord(
    ethers.constants.HashZero,
    ethers.keccak256(ethers.toUtf8Bytes(domain)),
    deployer.address,
    ethers.constants.AddressZero,
    0
  );

  // 创建子域名
  await ens.setSubnodeRecord(
    namehash(domain),
    ethers.keccak256(ethers.toUtf8Bytes(subdomain)),
    deployer.address,
    resolver.address,
    0
  );

  // 设置DID记录
  const didValue = `did:ethr:${deployer.address}`;
  await resolver.setText(namehash(fullDomain), "did", didValue);

  console.log("\n🎉 部署完成！");
  console.log("\n配置：");
  console.log(`ENSRegistry: ${ens.address}`);
  console.log(`PublicResolver: ${resolver.address}`);
  if (didRegistry) {
    console.log(`EthereumDIDRegistry: ${didRegistry.address}`);
    console.log(`\n前端使用：`);
    console.log(`const resolver = Resolver.fromResolverAddress(provider, "${resolver.address}", {`);
    console.log(`  didRegistryAddress: "${didRegistry.address}"`);
    console.log(`});`);
  } else {
    console.log(`\n前端使用：`);
    console.log(`const resolver = Resolver.fromResolverAddress(provider, "${resolver.address}");`);
  }
}

main().catch(console.error);
