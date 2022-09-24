import os
import zipfile
import logging
import json

handheld = [
    'wooden_sword',
    'wooden_shovel',
    'wooden_axe',
    'wooden_pickaxe',
    'wooden_hoe',
    'stone_sword',
    'stone_shovel',
    'stone_axe',
    'stone_pickaxe',
    'stone_hoe',
    'iron_sword',
    'iron_shovel',
    'iron_axe',
    'iron_pickaxe',
    'iron_hoe',
    'golden_sword',
    'golden_shovel',
    'golden_axe',
    'golden_pickaxe',
    'golden_hoe',
    'diamond_sword',
    'diamond_shovel',
    'diamond_axe',
    'diamond_pickaxe',
    'diamond_hoe',
    'netherite_sword',
    'netherite_shovel',
    'netherite_axe',
    'netherite_pickaxe',
    'netherite_hoe',
    'stick',
    'bamboo',
    'blaze_rod'
]

def saveJson(path, data):
    with open(path, 'w') as outfile:
        json.dump(data, outfile)

def zipdir(path, ziph): #https://stackoverflow.com/a/1855118
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file), 
                       os.path.relpath(os.path.join(root, file), 
                                       os.path.join(path, '..')))

try:
    path = os.path.dirname(os.path.realpath(__file__))
    files = [f for f in sorted(os.listdir(path + '/resources'))]
    resource_map = json.loads(open('resource_map.json', 'r').read())
    for f in files:
        if os.path.splitext(f)[1] == '.zip':
            print('Working ' + f + '...')
            file = zipfile.ZipFile('resources/' + f, 'r')
            with file as zip:
                zip.extractall()
                params = json.loads(open('params.json', 'r').read())
                textures = False
                if os.path.exists('textures_' + params['username'] + '.json'):
                    textures = json.loads(open('textures_' + params['username'] + '.json', 'r').read())
                else: textures = {}
                keys = json.loads(open('keys_' + params['username'] + '.json', 'r').read())

                legit = False
                key = int(params['key'])
                if key in keys['available']: legit = True
                if not legit:
                    old = False
                    if key in keys['used']: old = True
                    if old: print('Key has already been used!')
                    else: print('Unknown key!')
                else:
                    keys['used'].append(key) 
                    keys['available'].remove(key)
                    name = params['username'] + '_' + params['name']
                    if params['id'] in resource_map and name in resource_map[params['id']]:
                        print('Name has already been used!')
                    else:
                        if not params['id'] in resource_map:
                            resource_map[params['id']] = [name]
                        else:
                            resource_map[params['id']].append(name)
                        saveJson('resource_map.json', resource_map)
                        
                        model_id = len(resource_map[params['id']])
                        if not params['id'] in textures:
                            textures[params['id']] = {params['name']:model_id}
                        else:
                            textures[params['id']][params['name']] = model_id
                        saveJson('textures_' + params['username'].lower() + '.json', textures)
                        texture_id = params['id'] + '_' + name.lower()
                        if params['id'] == 'carved_pumpkin':
                            os.replace('texture.png', 'resources/pack/uncompressed/assets/minecraft/textures/models/custom/' + texture_id + '.png')
                        else:
                            os.replace('texture.png', 'resources/pack/uncompressed/assets/minecraft/textures/item/custom/' + texture_id + '.png')
                        if os.path.exists('model_texture.png'):
                            os.replace('model_texture.png', 'resources/pack/uncompressed/assets/minecraft/textures/models/armor/custom/' + texture_id + '.png')
                            cit = open(texture_id + '.properties','w+')
                            cit.write('type=armor' + '\n')
                            cit.write('items=' + params['id'] + '\n')
                            cit.write('texture=textures/models/armor/custom/' + texture_id + '\n')
                            cit.write('nbt.CustomModelData=' + str(model_id))
                            cit.close()
                            os.replace(texture_id + '.properties', 'resources/pack/uncompressed/assets/minecraft/optifine/cit/' + texture_id + '.properties')
                        file.close()
                        os.remove('resources/' + f)
                saveJson('keys_' + params['username'].lower() + '.json', keys)
    print('Cleaning...')
    if os.path.exists('params.json'):
        os.remove('params.json')
    if os.path.exists('texture.png'):
        os.remove('texture.png')
    if os.path.exists('model_texture.png'):
        os.remove('model_texture.png')
    print('Generating models...')
    for item in resource_map:
        model = {
	        'parent': 'item/generated',
	        'textures': {
		        'layer0': 'item/' + item
	        },
            'overrides': []
        }
        if item in handheld: model['parent'] = 'item/handheld'
        if item == 'carved_pumpkin':
            model['parent'] = 'block/carved_pumpkin'
            del model['textures']
        i = 0
        for texture in resource_map[item]:
            i += 1
            name = item + '_' + texture
            model['overrides'].append({'predicate': {'custom_model_data':i}, 'model': 'item/custom/' + name.lower()})
            
            if item == 'carved_pumpkin':
                custom_model = {
                    'parent': 'item/bases/generic_hat',
                    'textures': {
                        '0': 'models/custom/' + name.lower(),
                        'particle': 'models/custom/' + name.lower()
                    }
                }
            else:
                custom_model = {
                    'parent': 'item/generated',
                    'textures': {
                        'layer0': 'item/custom/' + name.lower()
                    }
                }
            if item in handheld: custom_model['parent'] = 'item/handheld'
            saveJson('resources/pack/uncompressed/assets/minecraft/models/item/custom/' + name.lower() + '.json', custom_model)
        saveJson('resources/pack/uncompressed/assets/minecraft/models/item/' + item + '.json', model)
    print('Compressing pack...')
    zipf = zipfile.ZipFile('resources/pack/lab_user_resourcepack.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('resources/pack/uncompressed/assets', zipf)
    zipf.write('resources/pack/uncompressed/pack.mcmeta', 'pack.mcmeta')
    zipf.write('resources/pack/uncompressed/pack.png', 'pack.png')
    zipf.close()
    input('Done!')
except:
    logging.exception('jonass moment')
    input()