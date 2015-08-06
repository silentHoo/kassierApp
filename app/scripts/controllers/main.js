'use strict';

/**
 * @ngdoc function
 * @name kassierApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the kassierApp
 */
angular.module('kassierApp')
  .controller('MainCtrl', function ($scope) {
    $scope.showOrder = false;

    $scope.articles = [
      { cat: 'alc',  name: 'Bier',                price: 2.20 },
      { cat: 'alc',  name: 'Radler',              price: 2.20 },
      { cat: 'alc',  name: 'Cola',                price: 2.20 },
      { cat: 'alf',  name: 'Fanta',               price: 2.20 },
      { cat: 'alf',  name: 'Wasser',              price: 2.20 },
      { cat: 'alf',  name: 'Bratwurst (rot)',     price: 2.20 },
      { cat: 'fod',  name: 'Bratwurst (weiss)',   price: 2.20 },
      { cat: 'fod',  name: 'Steakweck',           price: 2.20 },
      { cat: 'fod',  name: 'Tomate-Mozzarella',   price: 2.20 },
      { cat: 'fod',  name: 'Pommes',              price: 2.20 },
      { cat: 'fod',  name: 'Currywurst',          price: 2.20 }
    ];
    $scope.alc = $scope.articles.filter(function(e) {
      return e.cat == 'alc';
    });
    $scope.alf = $scope.articles.filter(function(e) {
      return e.cat == 'alf';
    });
    $scope.fod = $scope.articles.filter(function(e) {
      return e.cat == 'fod';
    });

    $scope.orders = [{
      tableNumber: 123,
      articles: [
        { cat: 'alf',  name: 'Fanta',             price: 2.20 },
        { cat: 'alf',  name: 'Wasser',            price: 2.20 },
        { cat: 'alf',  name: 'Bratwurst (rot)',   price: 2.20 },
        { cat: 'fod',  name: 'Bratwurst (weiss)', price: 2.20 }
      ]
    }, {
      tableNumber: 456,
      articles: [
        { cat: 'alf',  name: 'Fanta',             price: 2.20 },
        { cat: 'fod',  name: 'Bratwurst (weiss)', price: 2.20 }
      ]
    }];

    $scope.tableNumber = '';
    $scope.orderList = [];
    $scope.openOrder = function() {
      $scope.tableNumber = '';
      $scope.orderList = [];
      $scope.showOrder = true;
    };

    $scope.abortCounter = 3;
    $scope.closeOrder = function(abort) {
      if (abort === true) {
        if (--$scope.abortCounter == 0) {
          $scope.abortCounter = 3;
          $scope.showOrder = false;
        }
        return;
      }

      if ($scope.tableNumber === '') {
        return;
      }

      var orderExists = $scope.orders.filter(function(o) {
        return o.tableNumber === $scope.tableNumber;
      }).length === 1;

      if (orderExists) {
        // delete existing order for that table
        var arrIndex = $scope.orders.map(function(e) {
          return e.tableNumber;
        }).indexOf($scope.tableNumber);
        $scope.orders.splice(arrIndex, 1);
      }
      $scope.orders.push({
        tableNumber: $scope.tableNumber,
        articles: angular.copy($scope.orderList)
      });
      $scope.showOrder = false;
      calcArticleAggregation();
    };

    $scope.addArticle = function(article) {
      $scope.orderList.push(article);
    };

    $scope.removeArticle = function(article, event) {
      $scope.orderList.splice($scope.orderList.indexOf(article), 1);
      event.stopPropagation();
    };

    $scope.countOf = function(article) {
      return $scope.orderList.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;
    };

    $scope.openOrderFromExistingOrder = function(oList) {
      $scope.orderList = oList.articles;
      $scope.tableNumber = oList.tableNumber;
      $scope.showOrder = true;
    };

    /**
     * functions for pickup
     */
    $scope.pickup = {
      alf: [],
      alc: [],
      fod: []
    };
    var calcArticleAggregation = function() {
      ['alf', 'alc', 'fod'].forEach(function(cat) {
        var allOfCat = $scope.orders
          .map(function(e) {
            return e.articles;
          });
        allOfCat = [].concat.apply([], allOfCat);
        allOfCat = allOfCat.filter(function(e) {
          return e.cat === cat;
        });

        var counts = {};
        allOfCat
          .map(function(e) {
            return e.name
          })
          .forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

        var result = [];
        for (var o in counts) {
          result.push({
            count: counts[o],
            name: o
          });
        }
        $scope.pickup[cat] = result;
      });
    };

    /**
     * functions for billing
     */
    $scope.showBilling = false;
    $scope.billAlc = [];
    $scope.billAlf = [];
    $scope.billFod = [];
    $scope.makeBillForOrder = function(order) {
      $scope.currentBillingOrder = order;
      $scope.billAlc = order.articles.filter(function(e) {
        return e.cat === 'alc';
      });
      $scope.billAlf = order.articles.filter(function(e) {
        return e.cat === 'alf';
      });
      $scope.billFod = order.articles.filter(function(e) {
        return e.cat === 'fod';
      });
      $scope.showBilling = true;
    };

    $scope.closeBilling = function() {
      $scope.showBilling = false;
    };

    $scope.inverseCountOfBill = function(article) {
      var billListCount = $scope.billList.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;

      var orderListCount = $scope.currentBillingOrder.articles.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;

      return orderListCount - billListCount;
    };

    $scope.billList = [];
    $scope.addArticleToBill = function(article) {
      $scope.billList.push(article);
    };

    $scope.removeArticleFromBill = function(article) {
      $scope.billList.splice($scope.billList.indexOf(article), 1);
      event.stopPropagation();
    };

    $scope.addAllArticlesToBill = function() {
      $scope.billList = [];
      $scope.billList.push($scope.currentBillingOrder.articles);
    };

    $scope.payBill = function() {
      // 1) remove all $scope.billList items from $scope.currentBillingOrder
      // 2) if there are no elements left on $scope.currentBillingOrder, delete tableNumber from $scope.orders
    };
  });
