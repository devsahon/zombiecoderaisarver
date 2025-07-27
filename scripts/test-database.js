import {
    testConnection,
    getAgents,
    getUsers,
    getLicenses,
    getDatabaseStats,
    addSystemLog,
    getProviders,
    getProviderStats,
    getProviderUsageSummary,
    getAvailableModels,
    getProviderModels
} from '../lib/database.js';

async function testDatabase() {
    console.log('🔧 Testing AI Management System Database...\n');

    try {
        // Test connection
        console.log('1. Testing database connection...');
        const isConnected = await testConnection();
        if (!isConnected) {
            console.log('❌ Database connection failed');
            return;
        }
        console.log('✅ Database connection successful\n');

        // Get database statistics
        console.log('2. Getting database statistics...');
        const stats = await getDatabaseStats();
        console.log('📊 Database Statistics:');
        console.log(`   - Users: ${stats.users}`);
        console.log(`   - Agents: ${stats.agents}`);
        console.log(`   - Providers: ${stats.providers}`);
        console.log(`   - Models: ${stats.models}`);
        console.log(`   - Licenses: ${stats.licenses}`);
        console.log(`   - Conversations: ${stats.conversations}`);
        console.log(`   - System Logs: ${stats.logs}`);
        console.log(`   - Backup Logs: ${stats.backups}`);
        console.log(`   - Image Backups: ${stats.image_backups}`);
        console.log(`   - Usage Logs: ${stats.usage_logs}`);
        console.log(`   - Cache Entries: ${stats.cache_entries}`);
        console.log(`   - Health Checks: ${stats.health_checks}\n`);

        // Get providers
        console.log('3. Testing provider management...');
        const providers = await getProviders();
        console.log(`📋 Found ${providers.length} providers:\n`);
        
        // Group providers by type
        const providersByType = {};
        providers.forEach(provider => {
            if (!providersByType[provider.type]) {
                providersByType[provider.type] = [];
            }
            providersByType[provider.type].push(provider);
        });

        // Display providers by type
        Object.keys(providersByType).forEach(type => {
            console.log(`🔧 ${type.toUpperCase()} PROVIDERS:`);
            providersByType[type].forEach(provider => {
                const status = provider.status === 'active' ? '🟢' : '🔴';
                const free = provider.is_free ? '🆓' : '💰';
                console.log(`${status} ${free} ${provider.display_name}: ${provider.category} (${provider.status})`);
            });
            console.log('');
        });

        // Get provider statistics
        console.log('4. Getting provider statistics...');
        const providerStats = await getProviderStats();
        console.log('📈 Provider Statistics:');
        console.log(`   - Total Providers: ${providerStats.total_providers}`);
        console.log(`   - Active Providers: ${providerStats.active_providers}`);
        console.log(`   - Free Providers: ${providerStats.free_providers}`);
        console.log(`   - Paid Providers: ${providerStats.paid_providers}`);
        console.log(`   - Total Models: ${providerStats.total_models}`);
        console.log(`   - Usage Logs: ${providerStats.usage_logs}`);
        console.log(`   - Cache Entries: ${providerStats.cache_entries}\n`);

        // Get available models
        console.log('5. Testing model management...');
        const availableModels = await getAvailableModels();
        console.log(`🤖 Found ${availableModels.length} available models:\n`);
        
        // Group models by provider
        const modelsByProvider = {};
        availableModels.forEach(model => {
            if (!modelsByProvider[model.provider_name]) {
                modelsByProvider[model.provider_name] = [];
            }
            modelsByProvider[model.provider_name].push(model);
        });

        // Display models by provider
        Object.keys(modelsByProvider).forEach(providerName => {
            console.log(`🔧 ${providerName.toUpperCase()} MODELS:`);
            modelsByProvider[providerName].forEach(model => {
                console.log(`   - ${model.display_name}: ${model.model_type} (${model.is_available ? 'Available' : 'Unavailable'})`);
            });
            console.log('');
        });

        // Get agents with categories
        console.log('6. Fetching agents by category...');
        const agents = await getAgents();
        console.log(`📋 Found ${agents.length} agents:\n`);
        
        // Group agents by category
        const agentsByCategory = {};
        agents.forEach(agent => {
            const config = JSON.parse(agent.config || '{}');
            const category = config.category || 'uncategorized';
            if (!agentsByCategory[category]) {
                agentsByCategory[category] = [];
            }
            agentsByCategory[category].push(agent);
        });

        // Display agents by category
        Object.keys(agentsByCategory).forEach(category => {
            console.log(`🎯 ${category.toUpperCase()} AGENTS:`);
            agentsByCategory[category].forEach(agent => {
                const config = JSON.parse(agent.config || '{}');
                const isMaster = config.is_master ? '👑 ' : '   ';
                console.log(`${isMaster}${agent.display_name || agent.name}: ${agent.personality}`);
            });
            console.log('');
        });

        // Get users
        console.log('7. Fetching users...');
        const users = await getUsers();
        console.log(`👥 Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.role}): ${user.email}`);
        });
        console.log('');

        // Get licenses
        console.log('8. Fetching licenses...');
        const licenses = await getLicenses();
        console.log(`🔑 Found ${licenses.length} licenses:`);
        licenses.forEach(license => {
            console.log(`   - ${license.license_key} (${license.status})`);
        });
        console.log('');

        // Add test system log
        console.log('9. Adding test system log...');
        await addSystemLog({
            level: 'info',
            category: 'system',
            message: 'Database test completed successfully with new provider management system',
            context: {
                test: true,
                timestamp: new Date().toISOString(),
                agents_count: agents.length,
                providers_count: providers.length,
                models_count: availableModels.length,
                categories: Object.keys(agentsByCategory),
                provider_types: Object.keys(providersByType)
            }
        });
        console.log('✅ Test log added successfully\n');

        console.log('🎉 All database tests completed successfully!');
        console.log('\n📝 Summary:');
        console.log(`   - Total Agents: ${agents.length}`);
        console.log(`   - Total Providers: ${providers.length}`);
        console.log(`   - Available Models: ${availableModels.length}`);
        console.log(`   - Agent Categories: ${Object.keys(agentsByCategory).join(', ')}`);
        console.log(`   - Provider Types: ${Object.keys(providersByType).join(', ')}`);
        console.log(`   - Master Agent: ZombieCoder`);
        console.log(`   - Database Tables: ${Object.keys(stats).length} active`);

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

// Run the test
testDatabase();