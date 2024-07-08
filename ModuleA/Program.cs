using ModuleA;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddLogging(opt =>
        {
            opt.AddConsole(c =>
            {
                c.TimestampFormat = "[HH:mm:ss] ";
            });
        });
        services.AddHostedService<ModuleBackgroundService>();
    })
    .Build();

host.Run();