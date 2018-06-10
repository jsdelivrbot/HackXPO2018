from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.json_util import dumps
from sklearn import linear_model
import codecs, json
import numpy as np
from enum import Enum

from sklearn.ensemble import RandomForestRegressor


class WEATHER(Enum):
    Spring = 1
    Summer = 2
    Fall = 3
    Winter = 4


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


app = Flask(__name__)

# Database
client = MongoClient('localhost', 27017)
db = client['XPOL']

logisticsCollection = db['logistics']
lanesCollection = db['lanes']
trucksCollection = db['trucks']
carriersCollection = db['carriers']

lanes = {}
trucks = {}
carriers = {}

cursor = lanesCollection.find({})
for document in cursor:
    lanes[document['Lane']] = document['_id']

cursor = trucksCollection.find({})
for document in cursor:
    trucks[document['name']] = document['_id']

cursor = carriersCollection.find({})
for document in cursor:
    carriers[document['name']] = document['_id']

lassoInputX = []
lassoInputY = []

cursor = logisticsCollection.find({})
for document in cursor:
    xData = []
    yData = []
    xData.append(carriers[document['Carrier']])
    xData.append(trucks[document['Equipment Type']])
    xData.append(lanes[document['Lane']])
    xData.append(document["Fuel Charge"])
    yData.append(document['Total_Cost_USD'])
    lassoInputX.append(xData)
    lassoInputY.append(yData)

lassoModel = linear_model.Lasso(alpha=.2)
lassoModel.fit(lassoInputX, lassoInputY)

elasticNetModel = linear_model.ElasticNet(alpha=.2)
elasticNetModel.fit(lassoInputX, lassoInputY)

randomForestRegressor = RandomForestRegressor(random_state=1)
randomForestRegressor.fit(lassoInputX, lassoInputY)

'''
#Weather
Spring: April - June
Summer: July - September
Fall: October - December
Winter: January - March

    Spring = 1
    Summer = 2
    Fall = 3
    Winter=4
'''

# clf.fit([[0,0,1,0], [1,0, 13,0], [2,45, 65,1]], [10, 20, 30])

'''

clf.fit(

       [

         #miles,weather,traffic,Day =>  Exp ($)
         [200,0,1,1],
         [300,3,2,2],
         [400,2,0,2],
         [300,0,1,2],
         [300,3,1,2],


       ],

        [200,200,180,80,150] )
'''


@app.route("/")
def hello():
    return jsonify(trucks)


def error(code, message):
    return jsonify({code: code, message: message})


# LASSSO
@app.route("/lasso")
def lasso():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if (bool(urlParmeters) and urlParmeters.issubset(['carrier', 'equipment', 'lane', 'fuel'])):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = lassoModel.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])
        return json.dumps({"h": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)
    else:
        return error('201', 'Parameters Missing')


# ELASTONET GLM
@app.route("/glm")
def glmElasticNet():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if (bool(urlParmeters) and urlParmeters.issubset(['carrier', 'equipment', 'lane', 'fuel'])):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = elasticNetModel.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])
        return json.dumps({"h": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)
    else:
        return error('201', 'Parameters Missing')


@app.route("/rnd")
def randomForest():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if (bool(urlParmeters) and urlParmeters.issubset(['carrier', 'equipment', 'lane', 'fuel'])):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = randomForestRegressor.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])
        return json.dumps({"h": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)
    else:
        return error('201', 'Parameters Missing')


'''
    clf.fit([
        [200, 0, 0, 1],
        [401, 1, 1, 1],
        [802, 2, 2, 2],
        [903, 3, 2, 2]],

        [100, 700, 900, 1250]);
'''


# z= dashboardCollection.find({ "dollar_quality_trend" : "p"})
# dumps , jsonify ,
# l={clf.coef_}
# miles,weather,traffic,Day


# RandomForestRegressor
@app.route("/rndc")
def RandomForest():
    clf = RandomForestRegressor(random_state=1)
    clf.fit([[200, 0, 0, 1],
             [401, 1, 1, 1],
             [802, 2, 2, 2],
             [903, 3, 2, 2]], [100, 700, 900, 1250]);
    # z= dashboardCollection.find({ "dollar_quality_trend" : "p"})
    # dumps , jsonify ,
    # l={clf.coef_}
    pred = clf.predict([[210, 0, 1, 1]])
    return json.dumps({"h": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)


if __name__ == "__main__":
    app.run()
