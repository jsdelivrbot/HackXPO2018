package com.parser.ParserMaven;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class Parser {
public static void main(String[] args) {
try {
	ObjectMapper mapper=new ObjectMapper();
	File file=new File("data1.json");
	JsonNode nodeArray=mapper.readTree(file);
	String test=nodeArray.toString().replaceAll("\'","");
	JsonNode nodeArrayNew=mapper.readTree(test);
	ArrayNode finalNode=mapper.createArrayNode();
	for(JsonNode node:nodeArrayNew)
	{
		 DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		try {
			LocalDate dateTime=LocalDate.parse(node.get("DeliveryDate").asText().substring(0,10),dateFormatter);
			System.out.println(dateTime.format(dateFormatter));
			for(int i=0;i<100;i++)
			{
				JsonNode tempNode=mapper.createObjectNode();
				tempNode=node;
				String date=dateTime.format(dateFormatter);
				dateTime.plusDays(10);
				((ObjectNode)tempNode).put("DeliveryDate",date);
				finalNode.add(tempNode);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	ObjectWriter writer = mapper.writer(new DefaultPrettyPrinter());
	System.out.println("final Node");
	String finaString=finalNode.toString();
	System.out.println(finaString);
	writer.writeValue(new File("dateNew.json"), finalNode.toString());
} catch (Exception e) {
	e.printStackTrace();
}
	
}
}
