var builder = DistributedApplication.CreateBuilder(args);

// // Add Azure Storage emulator (Azurite)
// // var storage = builder.AddAzureStorage("storage").RunAsEmulator();
// var storage = builder.AddAzureStorage("storage")
//     .RunAsEmulator(emulator =>
//     {
//         // Enable Azurite's embedded UI
//         emulator.WithEnvironment("ENABLE_ACCESS_LOG", "true")
//                 .WithEnvironment("ENABLE_DEBUG_LOG", "true")
//                 .WithEnvironment("ENABLE_UI", "true");

//         // Expose UI port
//         emulator.WithEndpoint(
//             targetPort: 10002, 
//             name: "ui-port", 
//             scheme: "http"
//         );
//     });

// // Add blob container for file uploads
// var blobs = storage.AddBlobs("upload-container");

// Add CosmosDB emulator
#pragma warning disable ASPIRECOSMOSDB001
var cosmos = builder.AddAzureCosmosDB("cosmos")
    .RunAsPreviewEmulator((emulator =>
    {
        emulator
        .WithHttpsEndpoint(targetPort: 1234, name: "explorer-port", isProxied: true)
        .WithLifetime(ContainerLifetime.Persistent);
        // // --- OpenTelemetry -> Jaeger via OTLP/HTTP:4318 ---
        // // Enable OTEL in the emulator container
        // .WithEnvironment("AZURE_COSMOS_EMULATOR_ENABLE_TELEMETRY", "true")
        // .WithEnvironment("AZURE_COSMOS_EMULATOR_ENABLE_OTLP", "true")
        // .WithEnvironment("AZURE_COSMOS_EMULATOR_ENABLE_CONSOLE", "true");
    }));
#pragma warning restore ASPIRECOSMOSDB001

var cosmosdb = cosmos.AddCosmosDatabase("cosmosdb");
var container = cosmosdb.AddContainer("projects", "/projectid");

var api = builder.AddPnpmApp(name: "Api",
        workingDirectory: "..",
        scriptName: "server-dev"
    )
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithPnpmPackageInstallation()
    .WithReference(cosmos);
    //.WaitFor(cosmos);
    //.WithEnvironment("OTEL_EXPORTER_OTLP_PROTOCOL", "http/protobuf")
    //.WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318")
    //.WithEnvironment("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT", "http://localhost:4318/v1/metrics");

// var web = builder.AddPnpmApp(name: "Client",
//         workingDirectory: "..",
//         scriptName: "client-dev"
//     )
//     .WithHttpEndpoint(env: "PORT")
//     .WithExternalHttpEndpoints()
//     .WithPnpmPackageInstallation()
//     .WithReference(api)
//     .WaitFor(api); 

builder.Build().Run();
